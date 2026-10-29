<script lang="ts">
	import type { Snippet } from 'svelte'
	import ErrorPage from './ErrorPage.svelte'

	/** An error boundary that shows an ErrorPage with a refresh button. */
	let {
		messages,
		children,
		onerror,
	}: {
		messages: { header: string; para1: string; cta: string }
		children: Snippet
		onerror?: (error: unknown) => void
	} = $props()
</script>

<svelte:boundary {onerror}>
	{@render children()}
	{#snippet failed()}
		<ErrorPage {messages}>
			{#snippet cta()}
				<button type="button" onclick={() => window.location.reload()}>{messages.cta}</button>
			{/snippet}
		</ErrorPage>
	{/snippet}
</svelte:boundary>
