<script lang="ts" module>
	const BLEND_MODES = [
		{ id: 'normal', label: 'Normal' },
		{ id: 'multiply', label: 'Multiply' },
		{ id: 'screen', label: 'Screen' },
		{ id: 'overlay', label: 'Overlay' },
		{ id: 'difference', label: 'Difference' },
	] as const
</script>

<script lang="ts">
	import { fromComputed, getEditor, nativeEvents } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import type { BlendNode } from './BlendNode'
	import NodeImage from './NodeImage.svelte'
	import NodePlaceholder from './NodePlaceholder.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import { STOP_EXECUTION, updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<BlendNode> = $props()

	const editor = getEditor()
	const imageAInputValue = $derived(
		fromComputed('imageA input', () => getNodeInputPortValues(editor, shape.id).imageA)
	)
	const imageBInputValue = $derived(
		fromComputed('imageB input', () => getNodeInputPortValues(editor, shape.id).imageB)
	)
	const imageAInput = $derived(imageAInputValue.current)
	const imageBInput = $derived(imageBInputValue.current)

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<NodeRow>
	<Port shapeId={shape.id} portId="imageA" />
	<NodePortLabel dataType="image">Image A</NodePortLabel>
	{#if imageAInput}
		<span class="NodeRow-connected-value">
			{#if imageAInput.isOutOfDate || imageAInput.value === STOP_EXECUTION}
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
	<Port shapeId={shape.id} portId="imageB" />
	<NodePortLabel dataType="image">Image B</NodePortLabel>
	{#if imageBInput}
		<span class="NodeRow-connected-value">
			{#if imageBInput.isOutOfDate || imageBInput.value === STOP_EXECUTION}
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
	<select
		value={node.mode}
		onchange={(e) =>
			updateNode<BlendNode>(editor, shape, (n) => ({ ...n, mode: e.currentTarget.value }))}
	>
		{#each BLEND_MODES as m (m.id)}
			<option value={m.id}>
				{m.label}
			</option>
		{/each}
	</select>
</NodeRow>
<NodeRow class="NodeInputRow">
	<span class="NodeInputRow-label">Opacity</span>
	<input
		type="range"
		min="0"
		max="100"
		value={node.opacity}
		oninput={(e) =>
			updateNode<BlendNode>(
				editor,
				shape,
				(n) => ({
					...n,
					opacity: Number(e.currentTarget.value),
				}),
				false
			)}
		{@attach stopPointerDown}
	/>
	<span class="NodeRow-value">{node.opacity}%</span>
</NodeRow>
<div class={['NodeImagePreview', shape.props.isOutOfDate && 'NodeImagePreview_loading']}>
	{#if node.lastResultUrl}
		<NodeImage src={node.lastResultUrl} alt="Blended" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>Connect images to blend</span>
		</div>
	{/if}
</div>
