<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import type { DivideNode } from './DivideNode'
	import NodeInputRow from './NodeInputRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<DivideNode> = $props()

	const editor = getEditor()
</script>

<NodeInputRow
	shapeId={shape.id}
	portId="dividend"
	value={node.a}
	onChange={(newValue) =>
		updateNode<DivideNode>(editor, shape, (node) => ({ ...node, a: newValue }))}
/>
<NodeInputRow
	shapeId={shape.id}
	portId="divisor"
	value={node.b}
	onChange={(newValue) =>
		updateNode<DivideNode>(editor, shape, (node) => ({ ...node, b: newValue }))}
/>
