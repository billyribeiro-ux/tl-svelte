<script lang="ts">
	import { getClerk, getUser } from '../../utils/clerk.svelte'
	import TlaLogo from '../components/TlaLogo/TlaLogo.svelte'
	import { hasNotAcceptedLegal } from '../utils/auth'
	import ReturnViaRoot from './ReturnViaRoot.svelte'

	// The legal terms dialog lives in the app's providers, which this route sits outside, so a new
	// user would otherwise grant consent without ever accepting them.
	let { styles }: { styles: Record<string, string> } = $props()

	const clerkUser = getUser()
	const clerk = getClerk()

	function mountConsent(node: HTMLDivElement) {
		clerk.mountOAuthConsent(node, { appearance: { variables: { colorPrimary: '#1d1d1d' } } })
		return () => clerk.unmountOAuthConsent(node)
	}
</script>

{#if hasNotAcceptedLegal(clerkUser.current.user)}
	<ReturnViaRoot />
{:else}
	<TlaLogo class={styles.logo} />
	<div {@attach mountConsent}></div>
{/if}
