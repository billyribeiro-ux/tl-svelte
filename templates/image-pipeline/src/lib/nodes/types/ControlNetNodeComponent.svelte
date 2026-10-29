<script lang="ts" module>
	const CONTROL_MODES = [
		{ id: 'canny', label: 'Canny edge' },
		{ id: 'depth', label: 'Depth map' },
		{ id: 'pose', label: 'Pose' },
		{ id: 'segmentation', label: 'Segmentation' },
	] as const
</script>

<script lang="ts">
	import { fromComputed, getEditor, nativeEvents } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import NodeImage from './NodeImage.svelte'
	import NodePlaceholder from './NodePlaceholder.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import type { ControlNetNode } from './ControlNetNode'
	import { STOP_EXECUTION, updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<ControlNetNode> = $props()

	const editor = getEditor()

	const modelInputValue = $derived(
		fromComputed('model input', () => getNodeInputPortValues(editor, shape.id).model)
	)
	const imageInputValue = $derived(
		fromComputed('image input', () => getNodeInputPortValues(editor, shape.id).image)
	)
	const promptInputValue = $derived(
		fromComputed('prompt input', () => getNodeInputPortValues(editor, shape.id).prompt)
	)
	const modelInput = $derived(modelInputValue.current)
	const imageInput = $derived(imageInputValue.current)
	const promptInput = $derived(promptInputValue.current)

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<NodeRow>
	<Port shapeId={shape.id} portId="model" />
	<NodePortLabel dataType="model">Model</NodePortLabel>
	{#if modelInput}
		<span class="NodeRow-connected-value">
			{#if modelInput.isOutOfDate || modelInput.value === STOP_EXECUTION}
				<NodePlaceholder />
			{:else}
				{String(modelInput.value)}
			{/if}
		</span>
	{:else}
		<span class="NodeRow-disconnected">not connected</span>
	{/if}
</NodeRow>
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
<NodeRow>
	<span class="NodeInputRow-label">Mode</span>
	<select
		value={node.mode}
		onchange={(e) =>
			updateNode<ControlNetNode>(editor, shape, (n) => ({
				...n,
				mode: e.currentTarget.value,
			}))}
	>
		{#each CONTROL_MODES as m (m.id)}
			<option value={m.id}>
				{m.label}
			</option>
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
		oninput={(e) =>
			updateNode<ControlNetNode>(
				editor,
				shape,
				(n) => ({ ...n, strength: Number(e.currentTarget.value) }),
				false
			)}
		{@attach stopPointerDown}
	/>
	<span class="NodeRow-value">{node.strength}%</span>
</NodeRow>
<NodeRow class="NodeInputRow">
	<span class="NodeInputRow-label">Steps</span>
	<input
		type="range"
		min="1"
		max="50"
		value={node.steps}
		oninput={(e) =>
			updateNode<ControlNetNode>(
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
		<NodeImage src={node.lastResultUrl} alt="ControlNet result" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>Connect model + reference image</span>
		</div>
	{/if}
</div>
