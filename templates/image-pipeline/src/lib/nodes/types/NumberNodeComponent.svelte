<script lang="ts">
	import { getEditor, nativeEvents, SvelteDrawUiSlider } from 'svelte-draw'
	import type { NumberNode } from './NumberNode'
	import NodeRow from './NodeRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<NumberNode> = $props()
	const editor = getEditor()

	// Native listener: the event must be marked as handled before the editor's own listeners run.
	const markHandled = nativeEvents({ pointerdown: (e) => editor.markEventAsHandled(e) })
</script>

<NodeRow class="NumberNode" {@attach markHandled}>
	<SvelteDrawUiSlider
		steps={100}
		value={node.value}
		label="Value"
		title={node.value.toString()}
		onValueChange={(value) => {
			editor.setSelectedShapes([shape.id])
			updateNode<NumberNode>(editor, shape, (node) => ({ ...node, value }), false)
		}}
		onHistoryMark={() => {}}
	/>
</NodeRow>
