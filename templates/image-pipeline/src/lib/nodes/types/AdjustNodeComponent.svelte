<script lang="ts">
	import { fromComputed, getEditor, nativeEvents } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import type { AdjustNode } from './AdjustNode'
	import NodeImage from './NodeImage.svelte'
	import NodePlaceholder from './NodePlaceholder.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import { STOP_EXECUTION, updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<AdjustNode> = $props()

	const editor = getEditor()
	const imageInputValue = $derived(
		fromComputed('image input', () => getNodeInputPortValues(editor, shape.id).image)
	)
	const imageInput = $derived(imageInputValue.current)

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

{#snippet makeSlider(
	label: string,
	field: 'brightness' | 'contrast' | 'saturation',
	min: number,
	max: number
)}
	<NodeRow class="NodeInputRow">
		<span class="NodeInputRow-label">{label}</span>
		<input
			type="range"
			{min}
			{max}
			value={node[field]}
			oninput={(e) =>
				updateNode<AdjustNode>(
					editor,
					shape,
					(n) => ({
						...n,
						[field]: Number(e.currentTarget.value),
					}),
					false
				)}
			{@attach stopPointerDown}
		/>
		<span class="NodeRow-value">{node[field]}</span>
	</NodeRow>
{/snippet}

<NodeRow>
	<Port shapeId={shape.id} portId="image" />
	<NodePortLabel dataType="image">Image</NodePortLabel>
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
{@render makeSlider('Brightness', 'brightness', -50, 50)}
{@render makeSlider('Contrast', 'contrast', -50, 50)}
{@render makeSlider('Saturation', 'saturation', -50, 50)}
<div class={['NodeImagePreview', shape.props.isOutOfDate && 'NodeImagePreview_loading']}>
	{#if node.lastResultUrl}
		<NodeImage src={node.lastResultUrl} alt="Adjusted" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>Connect an image</span>
		</div>
	{/if}
</div>
