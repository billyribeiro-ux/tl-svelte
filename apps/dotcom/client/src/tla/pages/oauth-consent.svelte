<script lang="ts">
	import { bootedOnOAuthConsent } from '../../utils/clerkUi'
	import { getAuth } from '../../utils/clerk.svelte'
	import ConsentOnceLegalAccepted from './ConsentOnceLegalAccepted.svelte'
	import ReturnViaRoot from './ReturnViaRoot.svelte'
	import styles from './oauth-consent.module.css'

	// Clerk sends MCP and plugin OAuth clients here (dashboard: Paths → OAuth consent) instead of its
	// Account Portal. Clerk owns the consent logic and form POST; we only own the page around it, which
	// Clerk requires to carry no navigation or sign-out links.
	const auth = getAuth()

	if (!bootedOnOAuthConsent) {
		// Clerk only loads its UI bundle at boot, so a consent page reached by client-side navigation
		// has none: reload so it boots with it.
		window.location.reload()
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if bootedOnOAuthConsent}
	<div class={styles.page}>
		<!-- Clerk's <Show when="signed-in"> / <Show when="signed-out"> -->
		{#if auth.current.isLoaded && auth.current.isSignedIn}
			<ConsentOnceLegalAccepted {styles} />
		{:else if auth.current.isLoaded}
			<ReturnViaRoot openSignIn />
		{/if}
	</div>
{/if}
