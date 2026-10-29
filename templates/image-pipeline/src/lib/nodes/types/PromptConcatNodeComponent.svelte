<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import Port from '../../ports/Port.svelte'
	import { getNodeInputPortValues } from '../nodePorts'
	import NodePortLabel from './NodePortLabel.svelte'
	import NodeRow from './NodeRow.svelte'
	import { SEPARATORS, type PromptConcatNode } from './PromptConcatNode'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<PromptConcatNode> = $props()
	const editor = getEditor()

	const prefixValue = $derived(
		fromComputed('prefix', () => getNodeInputPortValues(editor, shape.id).prefix)
	)
	const mainValue = $derived(
		fromComputed('main', () => getNodeInputPortValues(editor, shape.id).main)
	)
	const suffixValue = $derived(
		fromComputed('suffix', () => getNodeInputPortValues(editor, shape.id).suffix)
	)
	const inputs = $derived([
		{ id: 'prefix', label: 'Prefix', info: prefixValue.current },
		{ id: 'main', label: 'Main', info: mainValue.current },
		{ id: 'suffix', label: 'Suffix', info: suffixValue.current },
	])

	const sep = $derived(SEPARATORS.find((s) => s.id === node.separator)?.value ?? ' ')
	const parts = $derived(
		inputs
			.map((i) => i.info?.value)
			.filter((v): v is string => typeof v === 'string' && v.length > 0)
	)
	const preview = $derived(parts.join(sep))
</script>

{#each inputs as input (input.id)}
	<NodeRow>
		<Port shapeId={shape.id} portId={input.id} />
		<NodePortLabel dataType="text">{input.label}</NodePortLabel>
		{#if input.info}
			<span class="NodeRow-connected-value">
				{typeof input.info.value === 'string' ? input.info.value.slice(0, 20) : 'connected'}
			</span>
		{:else}
			<span class="NodeRow-disconnected">not connected</span>
		{/if}
	</NodeRow>
{/each}
<NodeRow>
	<span class="NodeInputRow-label">Sep</span>
	<select
		value={node.separator}
		onchange={(e) => {
			const separator = e.currentTarget.value
			updateNode<PromptConcatNode>(editor, shape, (n) => ({ ...n, separator }))
		}}
	>
		{#each SEPARATORS as s (s.id)}
			<option value={s.id}>{s.label}</option>
		{/each}
	</select>
</NodeRow>
<NodeRow>
	<span class="NodeRow-connected-value" style="font-size: 10px; opacity: 0.7">
		{preview ? (preview.length > 40 ? preview.slice(0, 38) + '...' : preview) : 'no inputs'}
	</span>
</NodeRow>
