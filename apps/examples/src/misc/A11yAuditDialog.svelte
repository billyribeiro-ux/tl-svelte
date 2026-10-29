<script lang="ts">
	import { ExampleDialog } from 'svelte-draw'
	import A11yResultTable from './a11y.svelte'
	import { a11yAuditResults } from './a11yAuditResults.svelte'

	let { onClose }: { onClose(): void } = $props()

	const results = $derived(a11yAuditResults.current)
</script>

{#snippet body()}
	{#if results}
		<A11yResultTable {results} />
	{/if}
{/snippet}

<ExampleDialog
	{body}
	title="Accessibility Audit Results"
	maxWidth="80vw"
	cancel="Close"
	confirm="Ok"
	onCancel={() => onClose()}
	onContinue={() => onClose()}
/>
