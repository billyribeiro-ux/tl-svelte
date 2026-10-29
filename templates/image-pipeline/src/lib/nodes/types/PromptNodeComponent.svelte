<script lang="ts">
	import { getEditor, nativeEvents } from 'svelte-draw'
	import type { PromptNode } from './PromptNode'
	import NodeRow from './NodeRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<PromptNode> = $props()
	const editor = getEditor()

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<NodeRow class="PromptNode-row">
	<textarea
		class="PromptNode-textarea"
		value={node.text}
		placeholder="Enter your prompt..."
		oninput={(e) => {
			const text = e.currentTarget.value
			updateNode<PromptNode>(editor, shape, (n) => ({ ...n, text }), false)
		}}
		{@attach stopPointerDown}
		onfocus={() => editor.setSelectedShapes([shape.id])}
	></textarea>
</NodeRow>
