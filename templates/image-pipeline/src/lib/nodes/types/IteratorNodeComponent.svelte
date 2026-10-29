<script lang="ts">
	import { fromComputed, getEditor, nativeEvents } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import type { IteratorNode } from './IteratorNode'
	import NodeImage from './NodeImage.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<IteratorNode> = $props()

	const editor = getEditor()

	const templateInputValue = $derived(
		fromComputed('template', () => getNodeInputPortValues(editor, shape.id).template)
	)
	const templateInput = $derived(templateInputValue.current)

	const items = $derived(
		node.items
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0)
	)

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<NodeRow>
	<Port shapeId={shape.id} portId="template" />
	<NodePortLabel dataType="any">Template</NodePortLabel>
	{#if templateInput}
		<span class="NodeRow-connected-value">connected</span>
	{:else}
		<span class="NodeRow-disconnected">optional</span>
	{/if}
</NodeRow>
<NodeRow class="PromptNode-row">
	<textarea
		class="PromptNode-textarea"
		value={node.items}
		placeholder="One item per line..."
		oninput={(e) =>
			updateNode<IteratorNode>(editor, shape, (n) => ({
				...n,
				items: e.currentTarget.value,
			}))}
		{@attach stopPointerDown}
	></textarea>
</NodeRow>
<NodeRow>
	<span class="NodeInputRow-label" style:flex="1">
		{node.totalCount > 0
			? `${node.completedCount} / ${node.totalCount}`
			: `${items.length} item${items.length !== 1 ? 's' : ''}`}
	</span>
	{#if node.totalCount > 0 && node.completedCount < node.totalCount}
		<div
			style:flex="2"
			style:height="4px"
			style:background="var(--tl-color-muted-0)"
			style:border-radius="2px"
			style:overflow="hidden"
		>
			<div
				style:width="{(node.completedCount / node.totalCount) * 100}%"
				style:height="100%"
				style:background="var(--tl-color-selected)"
				style:transition="width 0.3s ease"
			></div>
		</div>
	{/if}
</NodeRow>
<div class={['NodeImagePreview', shape.props.isOutOfDate && 'NodeImagePreview_loading']}>
	{#if node.lastResultUrl}
		<NodeImage src={node.lastResultUrl} alt="Iterator result" />
	{:else}
		<div class="NodeImagePreview-empty">
			<span>Run to iterate items</span>
		</div>
	{/if}
</div>
