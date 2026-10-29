<script lang="ts">
	import type { RouterNode } from './RouterNode'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import type { NodeComponentProps } from './shared'

	let { node }: NodeComponentProps<RouterNode> = $props()
</script>

<NodeRow>
	<span class="Port Port_end" style:--port-color="var(--port-color-any)"></span>
	<NodePortLabel dataType="any">Input</NodePortLabel>
	<span class="NodeRow-connected-value">{node.outputCount} outputs</span>
</NodeRow>
{#each Array.from({ length: node.outputCount }, (_, i) => i) as i (i)}
	<NodeRow>
		<NodePortLabel dataType="any">Out {i + 1}</NodePortLabel>
	</NodeRow>
{/each}
