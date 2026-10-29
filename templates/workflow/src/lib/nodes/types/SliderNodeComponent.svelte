<script lang="ts">
	import { SvelteDrawUiSlider, getEditor, nativeEvents } from 'svelte-draw'
	import NodeRow from './NodeRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'
	import type { SliderNode } from './SliderNode'

	let { shape, node }: NodeComponentProps<SliderNode> = $props()

	const editor = getEditor()

	// Marked as handled on the native event, before the editor's own listeners run (Svelte would
	// delegate an `onpointerdown` attribute to the app root, which is too late).
	const events = nativeEvents({
		pointerdown: (e) => editor.markEventAsHandled(e),
	})
</script>

<NodeRow class="SliderNode" {@attach events}>
	<SvelteDrawUiSlider
		steps={100}
		value={node.value}
		label="Slider"
		title={node.value.toString()}
		onValueChange={(value) => {
			editor.setSelectedShapes([shape.id])
			updateNode<SliderNode>(editor, shape, (node) => ({ ...node, value }))
		}}
		onHistoryMark={() => {}}
	/>
</NodeRow>
