<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import NodeImage from './NodeImage.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import type { PreviewNode } from './PreviewNode'
	import { STOP_EXECUTION, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<PreviewNode> = $props()
	const editor = getEditor()

	const imageInputValue = $derived(
		fromComputed('image input', () => getNodeInputPortValues(editor, shape.id).image)
	)
	const imageInput = $derived(imageInputValue.current)

	const displayUrl = $derived(
		imageInput && !imageInput.isOutOfDate && imageInput.value !== STOP_EXECUTION
			? (imageInput.value as string)
			: node.lastImageUrl
	)
</script>

<NodeRow>
	<Port shapeId={shape.id} portId="image" />
	<NodePortLabel dataType="image">Image</NodePortLabel>
	{#if imageInput}
		<span class="NodeRow-connected-value">connected</span>
	{:else}
		<span class="NodeRow-disconnected">not connected</span>
	{/if}
</NodeRow>
<div class={['NodeImagePreview', shape.props.isOutOfDate && 'NodeImagePreview_loading']}>
	{#if displayUrl}
		<NodeImage src={displayUrl} alt="Preview" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>No image to preview</span>
		</div>
	{/if}
</div>
