<script lang="ts">
	import { fromComputed, getEditor, nativeEvents } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import NodeImage from './NodeImage.svelte'
	import NodePlaceholder from './NodePlaceholder.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import type { IPAdapterNode } from './IPAdapterNode'
	import { STOP_EXECUTION, updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<IPAdapterNode> = $props()

	const editor = getEditor()

	const imageInputValue = $derived(
		fromComputed('image input', () => getNodeInputPortValues(editor, shape.id).image)
	)
	const promptInputValue = $derived(
		fromComputed('prompt input', () => getNodeInputPortValues(editor, shape.id).prompt)
	)
	const imageInput = $derived(imageInputValue.current)
	const promptInput = $derived(promptInputValue.current)

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<NodeRow>
	<Port shapeId={shape.id} portId="image" />
	<NodePortLabel dataType="image">Reference</NodePortLabel>
	{#if imageInput}
		<span class="NodeRow-connected-value">
			{#if imageInput.isOutOfDate || imageInput.value === STOP_EXECUTION}
				<NodePlaceholder />
			{:else}
				connected
			{/if}
		</span>
	{:else}
		<span class="NodeRow-disconnected">not connected</span>
	{/if}
</NodeRow>
<NodeRow>
	<Port shapeId={shape.id} portId="prompt" />
	<NodePortLabel dataType="text">Prompt</NodePortLabel>
	{#if promptInput}
		<span class="NodeRow-connected-value">
			{#if promptInput.isOutOfDate || promptInput.value === STOP_EXECUTION}
				<NodePlaceholder />
			{:else if typeof promptInput.value === 'string'}
				{promptInput.value.slice(0, 15) + (promptInput.value.length > 15 ? '...' : '')}
			{:else}
				connected
			{/if}
		</span>
	{:else}
		<span class="NodeRow-disconnected">not connected</span>
	{/if}
</NodeRow>
<NodeRow class="NodeInputRow">
	<span class="NodeInputRow-label">Scale</span>
	<input
		type="range"
		min="0"
		max="100"
		value={node.scale}
		oninput={(e) =>
			updateNode<IPAdapterNode>(
				editor,
				shape,
				(n) => ({ ...n, scale: Number(e.currentTarget.value) }),
				false
			)}
		{@attach stopPointerDown}
	/>
	<span class="NodeRow-value">{node.scale}%</span>
</NodeRow>
<NodeRow class="NodeInputRow">
	<span class="NodeInputRow-label">Steps</span>
	<input
		type="range"
		min="1"
		max="50"
		value={node.steps}
		oninput={(e) =>
			updateNode<IPAdapterNode>(
				editor,
				shape,
				(n) => ({ ...n, steps: Number(e.currentTarget.value) }),
				false
			)}
		{@attach stopPointerDown}
	/>
	<span class="NodeRow-value">{node.steps}</span>
</NodeRow>
<div class={['NodeImagePreview', shape.props.isOutOfDate && 'NodeImagePreview_loading']}>
	{#if node.lastResultUrl}
		<NodeImage src={node.lastResultUrl} alt="IP-Adapter result" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>Connect a reference image</span>
		</div>
	{/if}
</div>
