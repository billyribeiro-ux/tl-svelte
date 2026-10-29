<script lang="ts">
	import type { EarthquakeNode } from './EarthquakeNode'
	import NodeRow from './NodeRow.svelte'
	import type { NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<EarthquakeNode> = $props()

	const earthquakeData = $derived(node.earthquakeData)
	const isLoading = $derived(shape.props.isOutOfDate)
</script>

<!-- Show helpful message when no data has been loaded yet (not loading and no data) -->
{#if !isLoading && !earthquakeData}
	<div class="EarthquakeNode">
		<div class="EarthquakeNode-message">
			Connect this node and run the workflow to fetch earthquake data
		</div>
	</div>
{:else}
	<div class="EarthquakeNode">
		<NodeRow>
			<div class="NodeValue">
				<strong>Magnitude:</strong>
				{isLoading ? '…' : earthquakeData!.magnitude.toFixed(1)}
			</div>
		</NodeRow>
		<NodeRow>
			<div class="NodeValue" style="font-size: 12px">
				<strong>Location:</strong>
				{isLoading ? '…' : earthquakeData!.location}
			</div>
		</NodeRow>
		<NodeRow>
			<div class="NodeValue" style="font-size: 12px">
				<strong>Time:</strong>
				{isLoading ? '…' : earthquakeData!.datetime}
			</div>
		</NodeRow>
	</div>
{/if}
