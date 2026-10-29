<script lang="ts">
	import { fromComputed, getEditor, nativeEvents } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import NodeImage from './NodeImage.svelte'
	import NodePlaceholder from './NodePlaceholder.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import { STOP_EXECUTION, updateNode, type NodeComponentProps } from './shared'
	import { STYLE_MODELS, type StyleTransferNode } from './StyleTransferNode'

	let { shape, node }: NodeComponentProps<StyleTransferNode> = $props()
	const editor = getEditor()

	const styleValue = $derived(
		fromComputed('style input', () => getNodeInputPortValues(editor, shape.id).style)
	)
	const contentValue = $derived(
		fromComputed('content input', () => getNodeInputPortValues(editor, shape.id).content)
	)
	const promptValue = $derived(
		fromComputed('prompt input', () => getNodeInputPortValues(editor, shape.id).prompt)
	)
	const styleInput = $derived(styleValue.current)
	const contentInput = $derived(contentValue.current)
	const promptInput = $derived(promptValue.current)

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<NodeRow>
	<Port shapeId={shape.id} portId="style" />
	<NodePortLabel dataType="image">Style</NodePortLabel>
	{#if styleInput}
		<span class="NodeRow-connected-value">
			{#if styleInput.isOutOfDate || styleInput.value === STOP_EXECUTION}
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
	<Port shapeId={shape.id} portId="content" />
	<NodePortLabel dataType="image">Content</NodePortLabel>
	{#if contentInput}
		<span class="NodeRow-connected-value">
			{#if contentInput.isOutOfDate || contentInput.value === STOP_EXECUTION}
				<NodePlaceholder />
			{:else}
				connected
			{/if}
		</span>
	{:else}
		<span class="NodeRow-disconnected">optional</span>
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
		<span class="NodeRow-disconnected">optional</span>
	{/if}
</NodeRow>
<NodeRow>
	<span class="NodeInputRow-label">Model</span>
	<select
		value={node.model}
		onchange={(e) => {
			const model = e.currentTarget.value
			updateNode<StyleTransferNode>(editor, shape, (n) => ({ ...n, model }))
		}}
	>
		{#each STYLE_MODELS as m (m.id)}
			<option value={m.id}>{m.label}</option>
		{/each}
	</select>
</NodeRow>
<NodeRow class="NodeInputRow">
	<span class="NodeInputRow-label">Strength</span>
	<input
		type="range"
		min="0"
		max="100"
		value={node.strength}
		oninput={(e) => {
			const strength = Number(e.currentTarget.value)
			updateNode<StyleTransferNode>(editor, shape, (n) => ({ ...n, strength }), false)
		}}
		{@attach stopPointerDown}
	/>
	<span class="NodeRow-value">{node.strength}%</span>
</NodeRow>
<div class={['NodeImagePreview', shape.props.isOutOfDate && 'NodeImagePreview_loading']}>
	{#if node.lastResultUrl}
		<NodeImage src={node.lastResultUrl} alt="Style transfer result" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>Connect a style image</span>
		</div>
	{/if}
</div>
