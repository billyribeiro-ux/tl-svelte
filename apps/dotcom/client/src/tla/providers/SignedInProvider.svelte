<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	export const appMessages = defineMessages({
		oldBrowser: {
			defaultMessage: 'Old browser detected. Please update your browser to use this app.',
		},
		clerkUnavailable: {
			defaultMessage: 'Unable to connect',
		},
		clerkUnavailablePara: {
			defaultMessage:
				"We're having trouble connecting to our authentication service. This is usually temporary. Please try refreshing the page.",
		},
		refresh: {
			defaultMessage: 'Refresh',
		},
	})

	const CLERK_LOAD_TIMEOUT_MS = 10_000
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'
	import { fromComputed } from 'svelte-draw'
	import ErrorPage from '../../components/ErrorPage/ErrorPage.svelte'
	import SignedInAnalytics from '../../utils/SignedInAnalytics.svelte'
	import SignedOutAnalytics from '../../utils/SignedOutAnalytics.svelte'
	import { getAuth, getUser } from '../../utils/clerk.svelte'
	import { getIntl } from '../../utils/intl'
	import { markFirstLoad } from '../../utils/firstLoad'
	import { globalEditor } from '../../utils/globalEditor'
	import AppStateProvider from '../hooks/AppStateProvider.svelte'
	import UserProvider from '../hooks/UserProvider.svelte'
	import {
		resetLocalSessionStateButKeepTheme,
		updateLocalSessionState,
	} from '../utils/local-session-state'
	import ThemeContainer from './ThemeContainer.svelte'
	import WhenAppReady from './WhenAppReady.svelte'

	let {
		children,
		onThemeChange,
		onLocaleChange,
	}: {
		children: Snippet
		onThemeChange(theme: 'light' | 'dark' | 'system'): void
		onLocaleChange(locale: string): void
	} = $props()

	const auth = getAuth()
	const intl = getIntl()
	const clerkUser = getUser()
	const locale = fromComputed(
		'locale',
		() => globalEditor.get()?.user.getUserPreferences().locale ?? 'en'
	)

	// Primitives, so the effects below depend on exactly what the React deps arrays named.
	const isLoaded = $derived(auth.current.isLoaded)
	const isSignedIn = $derived(auth.current.isSignedIn)
	const userId = $derived(auth.current.userId)

	$effect(() => {
		onLocaleChange(locale.current)
	})

	$effect(() => {
		if (isLoaded) markFirstLoad('clerk-loaded')
	})

	$effect(() => {
		if (isSignedIn && userId) {
			updateLocalSessionState(() => ({
				auth: { userId },
			}))
		} else if (isLoaded) {
			// auth.isSignedIn and auth.userId initialize as undefined, so we have to check if auth is loaded
			// otherwise the local session state gets cleared on signin erroneously
			resetLocalSessionStateButKeepTheme()
		}
	})

	let clerkTimedOut = $state(false)

	$effect(() => {
		if (isLoaded) return
		const timeout = setTimeout(() => (clerkTimedOut = true), CLERK_LOAD_TIMEOUT_MS)
		return () => clearTimeout(timeout)
	})

	// Old browsers check.
	const isOldBrowser = !('findLastIndex' in Array.prototype)
	const isSignedOut = $derived(
		!isSignedIn || !clerkUser.current.user || !clerkUser.current.isLoaded
	)
</script>

{#if !isLoaded}
	{#if clerkTimedOut}
		<ErrorPage
			messages={{
				header: intl.current.formatMessage(appMessages.clerkUnavailable),
				para1: intl.current.formatMessage(appMessages.clerkUnavailablePara),
			}}
		>
			{#snippet cta()}
				<button type="button" onclick={() => window.location.reload()}>
					{intl.current.formatMessage(appMessages.refresh)}
				</button>
			{/snippet}
		</ErrorPage>
	{/if}
{:else if isOldBrowser}
	<ErrorPage messages={{ header: intl.current.formatMessage(appMessages.oldBrowser), para1: '' }}>
		{#snippet cta()}{/snippet}
	</ErrorPage>
{:else if isSignedOut}
	<ThemeContainer {onThemeChange}>
		<SignedOutAnalytics />
		{@render children()}
	</ThemeContainer>
{:else}
	<AppStateProvider>
		<UserProvider>
			<ThemeContainer {onThemeChange}>
				<WhenAppReady>
					<SignedInAnalytics />
				</WhenAppReady>
				{@render children()}
			</ThemeContainer>
		</UserProvider>
	</AppStateProvider>
{/if}
