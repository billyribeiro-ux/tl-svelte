<script lang="ts">
	import { fromComputed, getEditor, nativeEvents } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import NodeImage from './NodeImage.svelte'
	import NodePlaceholder from './NodePlaceholder.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import type { GenerateNode } from './GenerateNode'
	import {
		isMultiInfoValue,
		STOP_EXECUTION,
		updateNode,
		type NodeComponentProps,
	} from './shared'

	let { shape, node }: NodeComponentProps<GenerateNode> = $props()

	const editor = getEditor()

	const modelInputValue = $derived(
		fromComputed('model input', () => getNodeInputPortValues(editor, shape.id).model)
	)
	const promptInputValue = $derived(
		fromComputed('prompt input', () => getNodeInputPortValues(editor, shape.id).prompt)
	)
	const negativeInputValue = $derived(
		fromComputed('negative input', () => getNodeInputPortValues(editor, shape.id).negative)
	)
	const imageInputValue = $derived(
		fromComputed('image input', () => getNodeInputPortValues(editor, shape.id).image)
	)
	const modelInput = $derived(modelInputValue.current)
	const promptInput = $derived(promptInputValue.current)
	const negativeInput = $derived(negativeInputValue.current)
	const imageInput = $derived(imageInputValue.current)

	const promptDisplay = $derived(
		promptInput
			? isMultiInfoValue(promptInput)
				? promptInput.value.filter((v): v is string => typeof v === 'string').join(', ')
				: String(promptInput.value ?? '')
			: ''
	)

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<NodeRow>
	<Port shapeId={shape.id} portId="model" />
	<NodePortLabel dataType="model">Model</NodePortLabel>
	{#if modelInput}
		<span class="NodeRow-connected-value">
			{#if modelInput.isOutOfDate}<NodePlaceholder />{:else}{String(modelInput.value)}{/if}
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
			{#if promptInput.isOutOfDate}
				<NodePlaceholder />
			{:else}
				<span title={promptDisplay}>
					{promptDisplay.slice(0, 20)}{promptDisplay.length > 20 ? '...' : ''}
				</span>
			{/if}
		</span>
	{:else}
		<span class="NodeRow-disconnected">not connected</span>
	{/if}
</NodeRow>
<NodeRow>
	<Port shapeId={shape.id} portId="negative" />
	<NodePortLabel dataType="text">Negative</NodePortLabel>
	{#if negativeInput}
		<span class="NodeRow-connected-value">
			{#if negativeInput.isOutOfDate || negativeInput.value === STOP_EXECUTION}
				<NodePlaceholder />
			{:else}
				<span title={String(negativeInput.value)}>
					{String(negativeInput.value ?? '').slice(0, 20)}
				</span>
			{/if}
		</span>
	{:else}
		<span class="NodeRow-disconnected">optional</span>
	{/if}
</NodeRow>
<NodeRow>
	<Port shapeId={shape.id} portId="image" />
	<NodePortLabel dataType="image">Ref image</NodePortLabel>
	{#if imageInput}
		<span class="NodeRow-connected-value">
			{#if imageInput.isOutOfDate}<NodePlaceholder />{:else}connected{/if}
		</span>
	{:else}
		<span class="NodeRow-disconnected">optional</span>
	{/if}
</NodeRow>
<div class={['NodeImagePreview', shape.props.isOutOfDate && 'NodeImagePreview_loading']}>
	{#if node.lastResultUrl}
		<NodeImage src={node.lastResultUrl} alt="Generated" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>Run pipeline to generate</span>
		</div>
	{/if}
</div>
<NodeRow class="NodeInputRow">
	<span class="NodeInputRow-label">Steps</span>
	<input
		type="range"
		min="1"
		max="100"
		value={node.steps}
		oninput={(e) =>
			updateNode<GenerateNode>(
				editor,
				shape,
				(n) => ({
					...n,
					steps: Number(e.currentTarget.value),
				}),
				false
			)}
		{@attach stopPointerDown}
	/>
	<span class="NodeRow-value">{node.steps}</span>
</NodeRow>
<NodeRow class="NodeInputRow">
	<span class="NodeInputRow-label">CFG</span>
	<input
		type="range"
		min="1"
		max="30"
		step="0.5"
		value={node.cfgScale}
		oninput={(e) =>
			updateNode<GenerateNode>(
				editor,
				shape,
				(n) => ({
					...n,
					cfgScale: Number(e.currentTarget.value),
				}),
				false
			)}
		{@attach stopPointerDown}
	/>
	<span class="NodeRow-value">{node.cfgScale}</span>
</NodeRow>
<NodeRow class="NodeInputRow">
	<span class="NodeInputRow-label">Seed</span>
	<input
		type="text"
		inputmode="numeric"
		value={node.seed}
		oninput={(e) => {
			const v = parseInt(e.currentTarget.value, 10)
			if (!isNaN(v)) {
				updateNode<GenerateNode>(editor, shape, (n) => ({
					...n,
					seed: Math.max(0, v),
				}))
			}
		}}
		{@attach stopPointerDown}
		onfocus={() => editor.setSelectedShapes([shape.id])}
	/>
</NodeRow>
