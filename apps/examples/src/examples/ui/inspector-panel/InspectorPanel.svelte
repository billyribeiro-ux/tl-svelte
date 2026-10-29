<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import BindingRow from './BindingRow.svelte'
	import PropertyRow from './PropertyRow.svelte'
	import SharedStyleRow from './SharedStyleRow.svelte'

	const editor = getEditor()

	// [1]
	const selectedShapes = fromComputed('selected shapes', () => editor.getSelectedShapes())
	const sharedStyles = fromComputed('shared styles', () => editor.getSharedStyles())
	const bindings = fromComputed('bindings', () => {
		const only = editor.getOnlySelectedShape()
		return only ? editor.getBindingsInvolvingShape(only.id) : []
	})

	const selectedShape = $derived(
		selectedShapes.current.length === 1 ? selectedShapes.current[0] : null
	)
	const shapeRest = $derived.by(() => {
		if (!selectedShape) return []
		const { props: _props, ...rest } = selectedShape
		return Object.entries(rest)
	})
</script>

<div class="inspector-panel">
	<h3>Inspector</h3>
	{#if selectedShapes.current.length === 0}
		<p>No shape selected</p>
	{:else if selectedShapes.current.length > 1}
		{#if sharedStyles.current.size > 0}
			<div class="inspector-section">
				<h4>Shared styles</h4>
				{#each Array.from(sharedStyles.current.entries()) as [styleProp, sharedStyle] (styleProp.id)}
					<SharedStyleRow {styleProp} {sharedStyle} />
				{/each}
			</div>
		{/if}
		<p>{selectedShapes.current.length} shapes selected</p>
	{:else if selectedShape}
		<div class="inspector-section">
			{#each shapeRest as [key, value] (key)}
				<PropertyRow name={key} {value} />
			{/each}
		</div>

		{#if Object.keys(selectedShape.props).length > 0}
			<div class="inspector-section">
				<h4>Shape props</h4>
				{#each Object.entries(selectedShape.props) as [key, value] (key)}
					<PropertyRow name={key} {value} />
				{/each}
			</div>
		{/if}

		{#if bindings.current.length > 0}
			<div class="inspector-section">
				<h4>Bindings ({bindings.current.length})</h4>
				{#each bindings.current as binding (binding.id)}
					<BindingRow {binding} selectedShapeId={selectedShape.id} />
				{/each}
			</div>
		{/if}
	{/if}
</div>
