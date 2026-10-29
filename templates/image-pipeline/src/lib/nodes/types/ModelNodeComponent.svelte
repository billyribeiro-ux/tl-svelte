<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import type { ModelNode } from './ModelNode'
	import { PROVIDERS } from './ModelNode'
	import NodeRow from './NodeRow.svelte'
	import { updateNode, type NodeComponentProps } from './shared'

	let { shape, node }: NodeComponentProps<ModelNode> = $props()
	const editor = getEditor()

	const provider = $derived(PROVIDERS[node.provider] ?? PROVIDERS['flux'])
	const models = $derived(provider.models)
</script>

<NodeRow>
	<span class="NodeInputRow-label">Provider</span>
	<select
		value={node.provider}
		onchange={(e) => {
			const newProvider = e.currentTarget.value
			const newModels = PROVIDERS[newProvider]?.models
			const firstModel = newModels?.[0]?.id ?? ''
			updateNode<ModelNode>(editor, shape, (n) => ({
				...n,
				provider: newProvider,
				modelId: firstModel,
			}))
		}}
	>
		{#each Object.entries(PROVIDERS) as [id, p] (id)}
			<option value={id}>{p.label}</option>
		{/each}
	</select>
</NodeRow>
<NodeRow>
	<span class="NodeInputRow-label">Model</span>
	<select
		value={node.modelId}
		onchange={(e) => {
			const modelId = e.currentTarget.value
			updateNode<ModelNode>(editor, shape, (n) => ({ ...n, modelId }))
		}}
	>
		{#each models as m (m.id)}
			<option value={m.id}>{m.label}</option>
		{/each}
	</select>
</NodeRow>
