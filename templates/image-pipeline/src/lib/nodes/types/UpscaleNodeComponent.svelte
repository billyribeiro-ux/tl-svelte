<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import NodeImage from './NodeImage.svelte'
	import NodePlaceholder from './NodePlaceholder.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import { STOP_EXECUTION, updateNode, type NodeComponentProps } from './shared'
	import { METHODS, SCALE_FACTORS, type UpscaleNode } from './UpscaleNode'

	let { shape, node }: NodeComponentProps<UpscaleNode> = $props()
	const editor = getEditor()

	const imageInputValue = $derived(
		fromComputed('image input', () => getNodeInputPortValues(editor, shape.id).image)
	)
	const imageInput = $derived(imageInputValue.current)
</script>

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
<NodeRow>
	<span class="NodeInputRow-label">Scale</span>
	<select
		value={node.scale}
		onchange={(e) => {
			const scale = e.currentTarget.value
			updateNode<UpscaleNode>(editor, shape, (n) => ({ ...n, scale }))
		}}
	>
		{#each SCALE_FACTORS as s (s.id)}
			<option value={s.id}>{s.label}</option>
		{/each}
	</select>
</NodeRow>
<NodeRow>
	<span class="NodeInputRow-label">Method</span>
	<select
		value={node.method}
		onchange={(e) => {
			const method = e.currentTarget.value
			updateNode<UpscaleNode>(editor, shape, (n) => ({ ...n, method }))
		}}
	>
		{#each METHODS as m (m.id)}
			<option value={m.id}>{m.label}</option>
		{/each}
	</select>
</NodeRow>
<div class={['NodeImagePreview', shape.props.isOutOfDate && 'NodeImagePreview_loading']}>
	{#if node.lastResultUrl}
		<NodeImage src={node.lastResultUrl} alt="Upscaled" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>Connect an image to upscale</span>
		</div>
	{/if}
</div>
