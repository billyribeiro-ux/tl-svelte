<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import type { MultiplyNode } from './MultiplyNode'
	import NodeInputRow from './NodeInputRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<MultiplyNode> = $props()

	const editor = getEditor()
</script>

<NodeInputRow
	shapeId={shape.id}
	portId="multiplicand"
	value={node.a}
	onChange={(newValue) =>
		updateNode<MultiplyNode>(editor, shape, (node) => ({ ...node, a: newValue }))}
/>
<NodeInputRow
	shapeId={shape.id}
	portId="multiplier"
	value={node.b}
	onChange={(newValue) =>
		updateNode<MultiplyNode>(editor, shape, (node) => ({ ...node, b: newValue }))}
/>
