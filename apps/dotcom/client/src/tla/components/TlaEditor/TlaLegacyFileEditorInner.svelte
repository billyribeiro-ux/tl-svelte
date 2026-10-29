<script lang="ts" module>
	import type { TLComponents } from 'svelte-draw'
	import TlaEditorErrorFallback from './editor-components/TlaEditorErrorFallback.svelte'
	import TlaEditorLegacySharePanel from './editor-components/TlaEditorLegacySharePanel.svelte'
	import TlaEditorMenuPanel from './editor-components/TlaEditorMenuPanel.svelte'
	import TlaEditorTopPanel from './editor-components/TlaEditorTopPanel.svelte'

	const components: TLComponents = {
		ErrorFallback: TlaEditorErrorFallback,
		MenuPanel: TlaEditorMenuPanel,
		SharePanel: TlaEditorLegacySharePanel,
		TopPanel: TlaEditorTopPanel,
		Dialogs: null,
		Toasts: null,
	}
</script>

<script lang="ts">
	import {
		getLicenseKey,
		ROOM_OPEN_MODE,
		RoomOpenModeToPath,
		type RoomOpenMode,
	} from '@svelte-draw/dotcom-shared'
	import { createSync } from '@svelte-draw/sync'
	import { commentSchemaRecords, SvelteDraw, type Editor } from 'svelte-draw'
	import StoreErrorScreen from '../../../components/StoreErrorScreen.svelte'
	import ThemeUpdater from '../../../components/ThemeUpdater/ThemeUpdater.svelte'
	import { setupLegacyUrlParams } from '../../../hooks/useLegacyUrlParams'
	import { getRoomLoadTracking } from '../../../hooks/useRoomLoadTracking'
	import { getHandleUiEvents, trackEvent } from '../../../utils/analytics'
	import { assetUrls } from '../../../utils/assetUrls'
	import { CLIENT_BUILD_TIMESTAMP, MULTIPLAYER_SERVER } from '../../../utils/config'
	import { createAssetFromUrl } from '../../../utils/createAssetFromUrl'
	import { embedShapeUtils } from '../../../utils/embedShapeUtil'
	import { globalEditor } from '../../../utils/globalEditor'
	import { multiplayerAssetStore } from '../../../utils/multiplayerAssetStore'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getSetIsReady } from '../../hooks/useIsReady.svelte'
	import SneakyDarkModeSync from './sneaky/SneakyDarkModeSync.svelte'
	import SneakyFileDropHandler from './sneaky/SneakyFileDropHandler.svelte'
	import SneakyLegacyModal from './sneaky/SneakyLegacyModal.svelte'
	import SneakyLegacySetDocumentTitle from './sneaky/SneakyLegacytSetDocumentTitle.svelte'
	import TlaEditorWrapper from './TlaEditorWrapper.svelte'
	import { getFileEditorOverrides } from './useFileEditorOverrides.svelte'

	let { fileSlug, roomOpenMode }: { roomOpenMode: RoomOpenMode; fileSlug: string } = $props()

	const app = getMaybeApp()
	const setIsReady = getSetIsReady()

	// make sure this runs before the editor is instantiated
	setupLegacyUrlParams()

	const handleUiEvent = getHandleUiEvents()
	const assets = multiplayerAssetStore()

	const storeWithStatus = createSync(() => ({
		uri: `${MULTIPLAYER_SERVER}/${RoomOpenModeToPath[roomOpenMode]}/${fileSlug}?v=${CLIENT_BUILD_TIMESTAMP}`,
		roomId: fileSlug,
		assets,
		trackAnalyticsEvent: trackEvent,
		// Register the comment record types so the schema matches the server's (see
		// fileSyncSchema in TLFileDurableObject) — without them the server rejects the
		// session as too old. Legacy rooms don't render a comments UI.
		records: commentSchemaRecords,
	}))

	const fileSystemUiOverrides = getFileEditorOverrides({})

	const isReadonly = $derived(
		roomOpenMode === ROOM_OPEN_MODE.READ_ONLY || roomOpenMode === ROOM_OPEN_MODE.READ_ONLY_LEGACY
	)

	const trackRoomLoaded = getRoomLoadTracking()

	function handleMount(editor: Editor) {
		trackRoomLoaded(editor)
		if (!isReadonly) {
			const w = window as Window & { app?: Editor; editor?: Editor }
			w.app = editor
			w.editor = editor
		}
		// Register the editor globally
		globalEditor.set(editor)
		editor.registerExternalAssetHandler('url', createAssetFromUrl)
		setIsReady()
	}

	const storeError = $derived(
		storeWithStatus.current.status === 'error' ? storeWithStatus.current.error : undefined
	)
	$effect.pre(() => {
		if (storeError) setIsReady()
	})
	const editorOverrides = $derived([fileSystemUiOverrides.current])
</script>

{#if storeError}
	<StoreErrorScreen error={storeError} />
{:else}
	<TlaEditorWrapper>
		<SvelteDraw
			className="tla-editor"
			licenseKey={getLicenseKey()}
			store={storeWithStatus.current}
			{assetUrls}
			shapeUtils={embedShapeUtils}
			onMount={handleMount}
			overrides={editorOverrides}
			initialState={isReadonly ? 'hand' : 'select'}
			onUiEvent={handleUiEvent}
			{components}
			options={{ actionShortcutsLocation: 'toolbar', deepLinks: true }}
		>
			<ThemeUpdater />
			<SneakyDarkModeSync />
			<SneakyLegacySetDocumentTitle />
			{#if roomOpenMode === 'read-write'}
				<SneakyLegacyModal />
			{/if}
			{#if app.current}
				<SneakyFileDropHandler />
			{/if}
		</SvelteDraw>
	</TlaEditorWrapper>
{/if}
