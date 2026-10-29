<script lang="ts">
	import { formatNumber, STOP_EXECUTION, type PipelineValue } from './shared'
	import NodePlaceholder from './NodePlaceholder.svelte'

	/**
	 * Format a pipeline value for display.
	 */
	let { value }: { value: PipelineValue | STOP_EXECUTION } = $props()

	// For strings, truncate long values
	const str = $derived(typeof value === 'string' ? value : '')
</script>

{#if value === STOP_EXECUTION || value === null}
	<NodePlaceholder />
{:else if typeof value === 'number'}
	{formatNumber(value)}
{:else if str.length > 20}
	<span title={str}>{str.slice(0, 18)}...</span>
{:else}
	{str}
{/if}
