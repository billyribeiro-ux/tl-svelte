<script lang="ts" module>
	import { defineMessages, type Editor, type TLSessionStateSnapshot } from 'svelte-draw'
	import { FileStateUpdater } from './FileStateUpdater'

	const messages = defineMessages({
		slurpFailed: {
			defaultMessage: 'Could not restore your local drawing. Try reloading this page.',
		},
	})
</script>

<script lang="ts">
	import { captureException } from '@sentry/browser'
	import { commentToolOverrides } from '@svelte-draw/commenting'
	import { getLicenseKey } from '@svelte-draw/dotcom-shared'
	import {
		atom,
		getDialogs,
		getToasts,
		getTranslation,
		SvelteDraw,
		tltime,
		type TLComponents,
		type TLUiDialogsContextType,
	} from 'svelte-draw'
	import { getRoomLoadTracking, boardSizeFields, estimateFileSizeBucket } from '../../../hooks/useRoomLoadTracking'
	import { setupPerformanceTracking } from '../../../hooks/usePerformanceTracking.svelte'
	import ThemeUpdater from '../../../components/ThemeUpdater/ThemeUpdater.svelte'
	import SneakyMermaidHandler from '../../../components/SneakyMermaidHandler/SneakyMermaidHandler.svelte'
	import { getHandleUiEvents, trackEvent } from '../../../utils/analytics'
	import { assetUrls } from '../../../utils/assetUrls'
	import { createAssetFromUrl } from '../../../utils/createAssetFromUrl'
	import { embedShapeUtils } from '../../../utils/embedShapeUtil'
	import { reportFileLoad } from '../../../utils/fileLoad'
	import { markFirstLoad, reportFirstLoad } from '../../../utils/firstLoad'
	import { globalEditor } from '../../../utils/globalEditor'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getIsCommentingEnabled } from '../../hooks/useIsCommentingEnabled.svelte'
	import { getSetIsReady } from '../../hooks/useIsReady.svelte'
	import { getNewRoomCreationTracking } from '../../hooks/useNewRoomCreationTracking'
	import { getShareLinkOpenTracking } from '../../hooks/useShareLinkOpenTracking'
	import { maybeSlurp } from '../../utils/slurping'
	import TlaAnonDotDevLink from '../TlaAnonDotDevLink/TlaAnonDotDevLink.svelte'
	import { getAnonCommentToolOverrides } from './anonCommentToolOverrides.svelte'
	import CommentsOnCanvas from './CommentsOnCanvas.svelte'
	import CustomDebugMenu from './CustomDebugMenu.svelte'
	import SneakyCommentDeepLink from './sneaky/SneakyCommentDeepLink.svelte'
	import SneakyDarkModeSync from './sneaky/SneakyDarkModeSync.svelte'
	import SneakyDebugModeToast from './sneaky/SneakyDebugModeToast.svelte'
	import SneakyFileDropHandler from './sneaky/SneakyFileDropHandler.svelte'
	import SneakyLargeFileHandler from './sneaky/SneakyLargeFileHandler.svelte'
	import SneakyToolSwitcher from './sneaky/SneakyToolSwitcher.svelte'
	import { components, tlaCommentTools } from './tlaEditorComponents'
	import TlaEditorWrapper from './TlaEditorWrapper.svelte'
	import { getFileLoad, getFileSyncStore } from './TlaFileSyncHost.svelte'
	import { getExtraDragIconOverrides } from './useExtraToolDragIcons.svelte'
	import { getFileEditorOverrides } from './useFileEditorOverrides.svelte'
	import { withComponentProps } from './withComponentProps'

	let {
		fileSlug,
		deepLinks,
		isEmbed = false,
	}: { fileSlug: string; deepLinks?: boolean; isEmbed?: boolean } = $props()

	const msg = getTranslation()
	const fileLoad = getFileLoad()
	fileLoad.mark('editor-rendered')
	markFirstLoad('editor-rendered')
	const handleUiEvent = getHandleUiEvents()
	const app = getMaybeApp()

	// The editor is remounted when the slug changes (the parent keys on it), so this never moves.
	// svelte-ignore state_referenced_locally
	const fileId = fileSlug

	const setIsReady = getSetIsReady()
	const { addToast } = getToasts()
	function showSlurpFailure() {
		addToast({
			id: 'local-file-restore-failed',
			severity: 'warning',
			title: msg(messages.slurpFailed),
			keepOpen: true,
		})
	}

	const dialogs = getDialogs()
	const addDialog: TLUiDialogsContextType['addDialog'] = (dialog) => dialogs.addDialog(dialog)

	// We cycle this flag to cause shapes to remount when slurping images/videos fails.
	// Because in that case we want to show the failure state for the images/videos.
	// i.e. where it appears that they are not present. so the user knows which ones failed.
	// There's probably a better way of doing this but I couldn't think of one.
	const hideAllShapes = atom('hideAllShapes', false)
	const getShapeVisibility = () => (hideAllShapes.get() ? 'hidden' : 'inherit')
	function remountImageShapes() {
		hideAllShapes.set(true)
		requestAnimationFrame(() => {
			hideAllShapes.set(false)
		})
	}

	const store = getFileSyncStore()

	const trackRoomLoaded = getRoomLoadTracking()
	const trackNewRoomCreation = getNewRoomCreationTracking()
	const trackShareLinkOpen = getShareLinkOpenTracking()
	const trackPerformance = setupPerformanceTracking()

	// Runs once, when the editor mounts, so it reads the app as it is then.
	function handleMount(editor: Editor) {
		const currentApp = app.current
		markFirstLoad('editor-mounted')
		fileLoad.mark('editor-mounted')
		trackRoomLoaded(editor)
		trackNewRoomCreation(currentApp, fileId)
		trackShareLinkOpen(currentApp, fileId, isEmbed)
		const cleanupPerf = trackPerformance(editor)
		const w = window as Window & { app?: unknown; editor?: Editor }
		w.app = currentApp
		w.editor = editor
		// Register the editor globally
		globalEditor.set(editor)

		// Register the external asset handler
		editor.registerExternalAssetHandler('url', createAssetFromUrl)

		if (!currentApp) {
			setIsReady()
			markFirstLoad('board-visible')
			fileLoad.mark('board-visible')
			const size = boardSizeFields(editor)
			reportFirstLoad({ email: null, flagEnabled: false, trackEvent, fileLoad, extra: size })
			reportFileLoad(fileLoad, {
				email: null,
				flagEnabled: false,
				trackEvent,
				extra: { file_size_bucket: estimateFileSizeBucket(editor), ...size },
			})
			return
		}

		const fileState = currentApp.getFileState(fileId)
		const deepLink = new URLSearchParams(window.location.search).get('d')
		let sessionState: TLSessionStateSnapshot | null = null
		if (fileState?.lastSessionState) {
			try {
				sessionState = JSON.parse(fileState.lastSessionState.trim() || 'null')
			} catch (err) {
				// A corrupt stored session state must not take the whole board down with it.
				captureException(err, {
					tags: { operation: 'parse-session-state' },
					extra: { fileId },
				})
			}
		}
		if (sessionState && deepLink) {
			// When using a deep link, only load preferences (not camera/page states)
			// since the deep link will control navigation
			const { pageStates: _, currentPageId: _cpid, ...preferencesOnly } = sessionState
			editor.loadSnapshot({ session: preferencesOnly }, { forceOverwriteSessionState: true })
		} else if (sessionState) {
			// No deep link - load the full session state including camera position
			editor.loadSnapshot({ session: sessionState }, { forceOverwriteSessionState: true })
		}
		if (deepLink) {
			// Let the SDK parse the link: a malformed `?d=` then zooms to fit instead of
			// throwing out of onMount and replacing the board with an error page.
			editor.navigateToDeepLink()
		}
		const fileStateUpdater = new FileStateUpdater(currentApp, fileId, editor)

		const abortController = new AbortController()
		maybeSlurp({
			app: currentApp,
			editor,
			fileId,
			abortSignal: abortController.signal,
			addDialog,
			remountImageShapes,
		})
			.catch((err) => {
				// ReadyWrapper keeps the editor invisible and inert until setIsReady runs, so a
				// failed slurp must not stop it from running.
				console.error('Failed to slurp local file', err)
				captureException(err, {
					tags: { operation: 'slurp-local-file' },
					extra: { fileId },
				})
				if (!abortController.signal.aborted) showSlurpFailure()
			})
			.then(() => {
				// A restore aborted by navigating away still resolves; the board it belonged to never
				// showed, so it must not take the one-shot report from the next one.
				if (abortController.signal.aborted) return
				setIsReady()
				markFirstLoad('board-visible')
				fileLoad.mark('board-visible')
				const size = boardSizeFields(editor)
				reportFirstLoad({
					email: currentApp.email,
					flagEnabled: currentApp.isLoadRumEnabled ?? false,
					trackEvent,
					fileLoad,
					extra: size,
				})
				reportFileLoad(fileLoad, {
					email: currentApp.email,
					flagEnabled: currentApp.isLoadRumEnabled ?? false,
					trackEvent,
					extra: { file_size_bucket: estimateFileSizeBucket(editor), ...size },
				})
			})

		return () => {
			cleanupPerf()
			fileStateUpdater.dispose()
			abortController.abort()
		}
	}

	// we need to prevent recording the file exit if the store is in an error state. A plain flag set
	// before the effects run, like the ref assigned during render it replaces.
	let storeError = false
	$effect.pre(() => {
		if (store.current.status === 'error') {
			storeError = true
		}
	})

	// Handle entering and exiting the file, with some protection against rapid enters/exits
	$effect(() => {
		const currentApp = app.current
		if (!currentApp) return
		if (store.current.status !== 'synced-remote') return
		let didEnter = false
		let timer: number

		const fileState = currentApp.getFileState(fileId)

		if (fileState && fileState.firstVisitAt) {
			// If there's a file state already then wait a second before marking it as entered
			timer = tltime.setTimeout(
				'file enter timer',
				() => {
					currentApp.onFileEnter(fileId)
					didEnter = true
				},
				1000
			)
		} else {
			// If there's not a file state yet (i.e. if we're visiting this for the first time) then do an enter
			currentApp.onFileEnter(fileId)
			didEnter = true
		}

		return () => {
			clearTimeout(timer)
			if (didEnter && !storeError) {
				currentApp.updateFileState(fileId, { lastVisitAt: Date.now() })
			}
		}
	})

	const overrides = getFileEditorOverrides({
		get fileSlug() {
			return fileSlug
		},
	})
	const extraDragIconOverrides = getExtraDragIconOverrides()
	const anonCommentToolOverrides = getAnonCommentToolOverrides()
	const commentingEnabled = getIsCommentingEnabled()

	const CommentsOnCanvasForFile = withComponentProps(CommentsOnCanvas, {
		get fileId() {
			return fileId
		},
	})
	const instanceComponents = $derived<TLComponents>({
		...components,
		DebugMenu: CustomDebugMenu,
		InFrontOfTheCanvas: commentingEnabled.current ? CommentsOnCanvasForFile : undefined,
	})

	// The comment tool overrides stay in for signed-out visitors too: `anonCommentToolOverrides`
	// turns their button into the sign-in dialog. On read-only canvases the button and `c` shortcut
	// hide via the UI's readonly handling, and composing is gated by the tool's `canComment`.
	const editorOverrides = $derived([
		overrides.current,
		extraDragIconOverrides.current,
		commentToolOverrides,
		anonCommentToolOverrides.current,
	])
</script>

<TlaEditorWrapper>
	<SvelteDraw
		className="tla-editor"
		licenseKey={getLicenseKey()}
		store={store.current}
		{assetUrls}
		shapeUtils={embedShapeUtils}
		tools={commentingEnabled.current ? tlaCommentTools : undefined}
		user={app.current?.tlUser}
		onMount={handleMount}
		onUiEvent={handleUiEvent}
		components={instanceComponents}
		options={{
			actionShortcutsLocation: 'toolbar',
			deepLinks: deepLinks ? true : undefined,
		}}
		overrides={editorOverrides}
		{getShapeVisibility}
	>
		<ThemeUpdater />
		<SneakyDarkModeSync />
		<SneakyToolSwitcher />
		<SneakyMermaidHandler />
		{#if app.current}
			<SneakyFileDropHandler />
		{/if}
		<SneakyLargeFileHandler />
		<SneakyDebugModeToast />
		{#if commentingEnabled.current}
			<SneakyCommentDeepLink />
		{/if}
		<TlaAnonDotDevLink />
	</SvelteDraw>
</TlaEditorWrapper>
