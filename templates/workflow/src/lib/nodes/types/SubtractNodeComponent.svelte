<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import type { SubtractNode } from './SubtractNode'
	import NodeInputRow from './NodeInputRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<SubtractNode> = $props()

	const editor = getEditor()
</script>

<NodeInputRow
	shapeId={shape.id}
	portId="minuend"
	value={node.a}
	onChange={(newValue) =>
		updateNode<SubtractNode>(editor, shape, (node) => ({ ...node, a: newValue }))}
/>
<NodeInputRow
	shapeId={shape.id}
	portId="subtrahend"
	value={node.b}
	onChange={(newValue) =>
		updateNode<SubtractNode>(editor, shape, (node) => ({ ...node, b: newValue }))}
/>
