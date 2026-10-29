<script lang="ts">
	import { formatValue } from './formatValue'

	let { name, value }: { name: string; value: unknown } = $props()

	let isExpanded = $state(false)
	const isObject = $derived(value !== null && typeof value === 'object')
</script>

{#if !isObject}
	<div class="property-row">
		<span class="property-name">{name}:</span>
		<span class="property-value">{formatValue(value)}</span>
	</div>
{:else}
	<div class="property-row">
		<div class="property-row-header">
			<span class="property-name">{name}:</span>
			<button
				class="toggle-button"
				onclick={() => (isExpanded = !isExpanded)}
				title={isExpanded ? 'Collapse' : 'Expand'}
			>
				{isExpanded ? '−' : '+'}
			</button>
			<span class="property-value">{formatValue(value)}</span>
		</div>
		{#if isExpanded}
			<div class="property-json">
				<pre>{JSON.stringify(value, null, 2)}</pre>
			</div>
		{/if}
	</div>
{/if}
