<script lang="ts">
	import { fromComputed, getEditor, type TLBinding, type TLShapeId } from 'svelte-draw'
	import PropertyRow from './PropertyRow.svelte'

	// [3]
	let { binding, selectedShapeId }: { binding: TLBinding; selectedShapeId: TLShapeId } = $props()

	const editor = getEditor()
	const isFrom = $derived(binding.fromId === selectedShapeId)
	const otherShapeId = $derived(isFrom ? binding.toId : binding.fromId)
	// Re-created when `otherShapeId` changes (the signal computation can't track Svelte props).
	const otherShape = $derived(fromComputed('other shape', () => editor.getShape(otherShapeId)))
</script>

<div class="binding-row">
	<div class="binding-header">
		<span class="binding-type">{binding.type}</span>
		<span class="binding-direction">({isFrom ? 'from' : 'to'})</span>
	</div>
	<PropertyRow name="id" value={binding.id} />
	<PropertyRow name={isFrom ? 'toId' : 'fromId'} value={otherShapeId} />
	{#if otherShape.current}
		<PropertyRow name="shape" value={otherShape.current.type} />
	{/if}
	{#if Object.keys(binding.props).length > 0}
		<PropertyRow name="props" value={binding.props} />
	{/if}
</div>
