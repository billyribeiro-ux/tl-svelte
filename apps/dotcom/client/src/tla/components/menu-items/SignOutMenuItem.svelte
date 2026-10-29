<script lang="ts">
	import { getTranslation, SvelteDrawUiMenuGroup, SvelteDrawUiMenuItem } from 'svelte-draw'
	import { signoutAnalytics } from '../../../utils/analytics'
	import { getAuth } from '../../../utils/clerk.svelte'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
	import { resetLocalSessionStateButKeepTheme } from '../../utils/local-session-state'
	import { messages } from './messages'

	const msg = getTranslation()
	const auth = getAuth()
	const app = getMaybeApp()

	const trackEvent = getSvelteDrawAppUiEvents()

	function handleSignout() {
		signoutAnalytics()
		auth.current
			.signOut()
			.then(async () => {
				resetLocalSessionStateButKeepTheme()
				// After sign-out rather than before: an IndexedDB delete waits for every connection to
				// the database to close, and other tabs only drop theirs once Clerk propagates sign-out.
				await app.current?.deleteLocalData()
			})
			.catch((err: unknown) => console.error('Sign out failed:', err))
		trackEvent('sign-out-clicked', { source: 'sidebar' })
	}
</script>

{#if auth.current.isSignedIn}
	<SvelteDrawUiMenuGroup id="account-actions">
		<SvelteDrawUiMenuItem
			id="sign-out"
			onSelect={handleSignout}
			label={msg(messages.signOut)}
			readonlyOk
		/>
	</SvelteDrawUiMenuGroup>
{/if}
