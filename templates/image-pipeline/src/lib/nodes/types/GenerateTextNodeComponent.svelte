<script lang="ts">
	import { fromComputed, getEditor, nativeEvents } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import type { GenerateTextNode } from './GenerateTextNode'
	import NodePlaceholder from './NodePlaceholder.svelte'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import type { NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<GenerateTextNode> = $props()

	const editor = getEditor()

	const inputPortValue = $derived(
		fromComputed('input port', () => getNodeInputPortValues(editor, shape.id).input)
	)
	const promptPortValue = $derived(
		fromComputed('prompt port', () => getNodeInputPortValues(editor, shape.id).prompt)
	)
	const inputPort = $derived(inputPortValue.current)
	const promptPort = $derived(promptPortValue.current)

	// Native listeners: delegated handlers would run after the editor's own listeners (pointerdown
	// and wheel must not reach the canvas, so the result text can be selected and scrolled).
	const stopEvents = nativeEvents({
		pointerdown: (e) => e.stopPropagation(),
		wheel: (e) => e.stopPropagation(),
	})
</script>

<NodeRow>
	<Port shapeId={shape.id} portId="input" />
	<NodePortLabel dataType="any">Input</NodePortLabel>
	{#if inputPort}
		<span class="NodeRow-connected-value">
			{#if inputPort.isOutOfDate}
				<NodePlaceholder />
			{:else}
				<span title={String(inputPort.value)}>
					{String(inputPort.value ?? '').slice(0, 20)}
					{String(inputPort.value ?? '').length > 20 ? '...' : ''}
				</span>
			{/if}
		</span>
	{:else}
		<span class="NodeRow-disconnected">not connected</span>
	{/if}
</NodeRow>
<NodeRow>
	<Port shapeId={shape.id} portId="prompt" />
	<NodePortLabel dataType="text">Prompt</NodePortLabel>
	{#if promptPort}
		<span class="NodeRow-connected-value">
			{#if promptPort.isOutOfDate}
				<NodePlaceholder />
			{:else}
				<span title={String(promptPort.value)}>
					{String(promptPort.value ?? '').slice(0, 20)}
					{String(promptPort.value ?? '').length > 20 ? '...' : ''}
				</span>
			{/if}
		</span>
	{:else}
		<span class="NodeRow-disconnected">optional</span>
	{/if}
</NodeRow>
<div
	class={['GenerateTextNode-result', shape.props.isOutOfDate && 'GenerateTextNode-result_loading']}
	{@attach stopEvents}
>
	{#if node.lastResultText}
		<div class="GenerateTextNode-result-text">{node.lastResultText}</div>
	{:else}
		<div class="GenerateTextNode-result-empty">
			<span>Run to generate text</span>
		</div>
	{/if}
</div>
