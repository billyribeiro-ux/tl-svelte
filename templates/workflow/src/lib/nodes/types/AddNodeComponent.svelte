<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { indexListEntries } from '../../utils'
	import { ensureFinalEmptyItem, type AddNode } from './AddNode'
	import NodeInputRow from './NodeInputRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<AddNode> = $props()

	const editor = getEditor()
</script>

{#each indexListEntries(node.items) as [idx, value] (idx)}
	<NodeInputRow
		shapeId={shape.id}
		portId={`item_${idx}`}
		{value}
		onChange={(newValue) => {
			updateNode<AddNode>(editor, shape, (node) => ({
				...node,
				items: ensureFinalEmptyItem(editor, shape, { ...node.items, [idx]: newValue }),
			}))
		}}
		onBlur={() => {
			updateNode<AddNode>(editor, shape, (node) => ({
				...node,
				items: ensureFinalEmptyItem(editor, shape, node.items, { removeUnused: true }),
			}))
		}}
	/>
{/each}
