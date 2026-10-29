<script lang="ts">
	import { captureException } from '@sentry/browser'
	import type { Snippet } from 'svelte'
	import { untrack } from 'svelte'
	import ErrorPage from '../../components/ErrorPage/ErrorPage.svelte'
	import { getAuth, getUser } from '../../utils/clerk.svelte'
	import { markFirstLoad } from '../../utils/firstLoad'
	import { navigate } from '../../utils/router.svelte'
	import { SvelteDrawApp, getPreloadDiagnostics } from '../app/SvelteDrawApp'
	import { getSvelteDrawAppUiEvents } from '../utils/app-ui-events'
	import { tokenOrUndefinedWhenOffline } from '../utils/auth'
	import {
		DEFAULT_FLAGS,
		type FeatureFlags,
		fetchFeatureFlags,
		wasAuthenticated,
	} from '../utils/featureFlags'
	import { currentApp$, isClientTooOld$, setAppState } from './useAppState.svelte'

	/**
	 * Signed-in only: builds the `SvelteDrawApp` (Zero preload) and exposes it through
	 * `getMaybeApp()` / `getApp()` / `getIsAppLoading()`.
	 */
	let { children }: { children: Snippet } = $props()

	const APP_LOAD_ERROR_MESSAGES = {
		header: 'Something went wrong',
		para1:
			'Please try refreshing the page. Still having trouble? Let us know at hello@svelte-draw.invalid.',
		cta: 'Refresh',
	}

	setAppState()

	const auth = getAuth()
	const clerkUser = getUser()
	const trackEvent = getSvelteDrawAppUiEvents()

	let error = $state<unknown>(null)

	// Cleared on unmount only. A Clerk user change (accepting the legal terms updates the user)
	// re-runs the bootstrap below; nulling the atom there would blank every gated route for the
	// whole preload, so the old app stays in place until the new one replaces it.
	$effect(() => {
		return () => {
			currentApp$.set(null)
		}
	})

	// The bootstrap re-runs when the signed-in user's id or the Clerk user object changes, and for
	// nothing else (`[auth.userId, user]`): everything else it reads is read untracked.
	const authUserId = $derived(auth.current.userId)
	const authUser = $derived(clerkUser.current.user)

	$effect(() => {
		void authUserId
		void authUser
		return untrack(() => {
			const { isSignedIn, userId, getToken } = auth.current
			const { user, isLoaded } = clerkUser.current
			if (!isSignedIn || !user || !isLoaded) {
				throw new Error('should have redirected in TlaRootProviders')
			}
			const email = user.primaryEmailAddress?.emailAddress

			let _app: SvelteDrawApp | undefined
			let didCancel = false
			const abort = new AbortController()
			error = null

			const FETCH_TIMEOUT = 5000
			function fetchFlagsWithTimeout(): Promise<FeatureFlags> {
				return Promise.race([
					fetchFeatureFlags(),
					new Promise<FeatureFlags>((resolve) =>
						setTimeout(() => resolve({ ...DEFAULT_FLAGS }), FETCH_TIMEOUT)
					),
				])
			}

			;(async () => {
				let flags = await fetchFlagsWithTimeout()
				if (!wasAuthenticated()) {
					flags = await fetchFlagsWithTimeout()
				}
				markFirstLoad('flags-loaded')
				if (didCancel) return
				const token = await getToken()
				if (!token) throw new Error('no token')
				const { app } = await SvelteDrawApp.create({
					userId: userId!,
					email,
					flags,
					getToken: async () => {
						const token = await getToken()
						return token || undefined
					},
					// `skipCache` is load-bearing, not belt and braces: Clerk hands back a cached token
					// until it is nearly expired, and the refresh schedules itself from the *remaining*
					// life of whatever it is given. Cached tokens would shorten that interval on every
					// pass — 90s, then 45s, then 22s — until it bottomed out against its floor.
					// Zero boots tokenless and picks a token up on its next refresh, so offline must not reject.
					getZeroToken: () =>
						tokenOrUndefinedWhenOffline(() => getToken({ template: 'zero', skipCache: true })),
					onClientTooOld: () => {
						isClientTooOld$.set(true)
					},
					trackEvent,
					navigate,
					signal: abort.signal,
				})
				if (didCancel) {
					app.dispose()
					return
				}
				_app = app
				currentApp$.set(app)
			})().catch((err) => {
				if (didCancel) return
				console.error('[AppState] Failed to initialize:', err)
				// Default grouping keys on the stack, which every preload timeout shares; the message
				// carries the stalled stage or init status, so group on it. The Zero connection state
				// goes on a tag rather than the fingerprint so one stage stays one issue.
				const diagnostics = getPreloadDiagnostics(err)
				captureException(err, {
					fingerprint: ['{{ default }}', err instanceof Error ? err.message : String(err)],
					tags: diagnostics && { zero_connection: diagnostics.connection },
				})
				error = err
			})

			return () => {
				didCancel = true
				abort.abort()
				if (_app) {
					_app.dispose()
				}
			}
		})
	})
</script>

{#if error}
	<!-- A swallowed bootstrap failure would leave the blank loading state up for the whole session. -->
	<ErrorPage messages={APP_LOAD_ERROR_MESSAGES}>
		{#snippet cta()}
			<button type="button" onclick={() => window.location.reload()}>
				{APP_LOAD_ERROR_MESSAGES.cta}
			</button>
		{/snippet}
	</ErrorPage>
{:else}
	<!--
		Children render while the app loads so the file route can open its sync socket in parallel
		with the Zero preload. Routes that cannot cope with a null app are held back by the
		AppGate in the (tla) layout, not here.
	-->
	{@render children()}
{/if}
