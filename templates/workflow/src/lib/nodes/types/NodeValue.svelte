<script lang="ts">
	import { formatNumber } from './formatNumber'
	import { STOP_EXECUTION } from './shared'

	/**
	 * A value within a node. If the value is STOP_EXECUTION, a placeholder is shown instead.
	 */
	let { value }: { value: number | STOP_EXECUTION } = $props()
</script>

{#if value === STOP_EXECUTION}
	<div class="NodeValue_placeholder"></div>
{:else}
	{formatNumber(value)}
{/if}
