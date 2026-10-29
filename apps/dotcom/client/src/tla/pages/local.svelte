<script lang="ts">
	import { untrack } from 'svelte'
	import { assert, getFromSessionStorage, omit } from 'svelte-draw'
	import { routes } from '../../routeDefs'
	import { getAuth, getUser } from '../../utils/clerk.svelte'
	import { location, navigate } from '../../utils/router.svelte'
	import { VIA_LAST_FILE_CACHE } from '../components/TlaEditor/TlaFileSyncHost.svelte'
	import { getIsAppLoading, getMaybeApp } from '../hooks/useAppState.svelte'
	import { hasNotAcceptedLegal } from '../utils/auth'
	import { startCachedFileVisit } from '../utils/cachedFileVisit'
	import { importFromUrl } from '../utils/importFromUrl'
	import { getLastVisitedFileId } from '../utils/local-session-state'
	import { clearRedirectOnSignIn } from '../utils/redirect'
	import { SESSION_STORAGE_KEYS } from '../utils/session-storage'
	import { clearShouldSlurpFile, getShouldSlurpFile } from '../utils/slurping'
	import LocalSvelteDraw from './LocalSvelteDraw.svelte'

	const app = getMaybeApp()
	const isAppLoading = getIsAppLoading()
	const clerkUser = getUser()
	const auth = getAuth()
	const legalPending = $derived(hasNotAcceptedLegal(clerkUser.current.user))
	const userId = $derived(auth.current.userId)

	// Signed in, Zero still preloading: go straight to the file this browser last synced to so its
	// socket opens in parallel with the preload. Anything the app must handle (OAuth redirect,
	// import, slurp) waits for the effect below, so the cache never preempts a file the user is
	// mid-way through creating. A stale cached id comes back here from the file page, cleared.
	$effect(() => {
		// `location` changes identity on every navigation, so any navigation re-runs this.
		void location.href
		const state = location.state
		const loading = isAppLoading.current
		if (app.current || !loading || !userId) return
		const currentUserId = userId
		untrack(() => {
			if (getFromSessionStorage(SESSION_STORAGE_KEYS.REDIRECT)) return
			if (state?.importUrl || getShouldSlurpFile()) return
			const cachedFileId = getLastVisitedFileId(currentUserId)
			if (!cachedFileId) return
			navigate(routes.tlaFile(cachedFileId), {
				replace: true,
				state: { ...state, [VIA_LAST_FILE_CACHE]: startCachedFileVisit() },
			})
		})
	})

	$effect(() => {
		const currentApp = app.current
		void location.href
		const state = location.state
		const legal = legalPending

		const handleFileOperations = async () => {
			if (!currentApp) return

			// Check for redirect-to first (set by OAuth sign-in)
			const redirectTo = getFromSessionStorage(SESSION_STORAGE_KEYS.REDIRECT)
			if (redirectTo) {
				// The redirect can leave the app's providers (the OAuth consent page does), taking the
				// legal terms dialog with it. Hold it until the terms are accepted.
				if (legal) return
				clearRedirectOnSignIn()
				if (redirectTo.startsWith('/')) {
					navigate(redirectTo, { replace: true })
					return
				}
			}

			// Run pending import from URL (set by /import?url=... redirect)
			const pendingImportUrl = state?.importUrl
			if (pendingImportUrl) {
				// need to remove importUrl from location state so it doesn't persist after the import
				const nextState = omit(state, ['importUrl'])
				const result = await importFromUrl(currentApp, pendingImportUrl)
				if (result.ok) {
					navigate(routes.tlaFile(result.fileId), { replace: true, state: nextState })
					return
				}
				// just update the state without navigating anywhere
				navigate('.', { replace: true, state: nextState })
				if (!result.toastAlreadyShown) {
					currentApp.toasts?.addToast({
						severity: 'error',
						title: 'Import failed',
						description: result.error,
						keepOpen: true,
					})
				}
				return
			}

			if (getShouldSlurpFile()) {
				const res = await currentApp.slurpFile()
				// Fails when the user has too many files; leaving the local content
				// unslurped means it's still there when they log out.
				if (res.ok) {
					clearShouldSlurpFile()
					navigate(routes.tlaFile(res.value.fileId), { replace: true, state })
					return
				}
			}

			// Land on the file the user last had open, across all workspaces, not just home.
			const mostRecentFileId = currentApp.getMostRecentFileId()
			if (!mostRecentFileId) {
				const result = await currentApp.createFile()

				assert(result.ok, 'Failed to create file')
				// result is only false if the user reached their file limit so
				// we don't need to handle that case here since they have no files
				navigate(routes.tlaFile(result.value.fileId), { replace: true, state })
				return
			}

			navigate(routes.tlaFile(mostRecentFileId), { replace: true, state })
		}

		untrack(() => {
			handleFileOperations()
		})
	})
</script>

<!--
	A signed-in user must never see the scratch editor: it would start slurp detection on whatever
	is in the local doc. Navigation for a signed-in user is handled by the effects above.
-->
{#if !app.current && !isAppLoading.current}
	<LocalSvelteDraw />
{/if}
