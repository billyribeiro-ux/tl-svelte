<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { operators, type ConditionalNode, type Operator } from './ConditionalNode'
	import NodeInputRow from './NodeInputRow.svelte'
	import NodeRow from './NodeRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<ConditionalNode> = $props()

	const editor = getEditor()
</script>

<NodeInputRow
	shapeId={shape.id}
	portId="lhs"
	value={node.lhs}
	onChange={(newValue) =>
		updateNode<ConditionalNode>(editor, shape, (node) => ({ ...node, lhs: newValue }))}
/>
<NodeRow>
	<select
		value={node.operator}
		onchange={(e) =>
			updateNode<ConditionalNode>(editor, shape, (node) => ({
				...node,
				operator: e.currentTarget.value as Operator,
			}))}
	>
		{#each Object.entries(operators) as [operator, { title }] (operator)}
			<option value={operator}>
				{title}
			</option>
		{/each}
	</select>
</NodeRow>
<NodeInputRow
	shapeId={shape.id}
	portId="rhs"
	value={node.rhs}
	onChange={(newValue) =>
		updateNode<ConditionalNode>(editor, shape, (node) => ({ ...node, rhs: newValue }))}
/>
<NodeRow class="ConditionalNode-output">
	Then
	<Port shapeId={shape.id} portId="outputTrue" />
</NodeRow>
<NodeRow class="ConditionalNode-output ConditionalNode-output-false">
	Otherwise
	<Port shapeId={shape.id} portId="outputFalse" />
</NodeRow>
