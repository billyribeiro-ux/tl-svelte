<script lang="ts" module>
	// [1]
	const ALIGN_OPERATIONS = [
		{ operation: 'left', label: 'Align left' },
		{ operation: 'center-horizontal', label: 'Align center H' },
		{ operation: 'right', label: 'Align right' },
		{ operation: 'top', label: 'Align top' },
		{ operation: 'center-vertical', label: 'Align center V' },
		{ operation: 'bottom', label: 'Align bottom' },
		{ operation: 'center', label: 'Align center' },
	] as const

	const DISTRIBUTE_OPERATIONS = [
		{ operation: 'horizontal', label: 'Distribute horizontal' },
		{ operation: 'vertical', label: 'Distribute vertical' },
	] as const
</script>

<script lang="ts">
	import { getEditor, SvelteDrawUiButton } from 'svelte-draw'
	import { originalPositions } from './originalPositions'

	const editor = getEditor()
</script>

<div class="tlui-menu control-panel">
	{#each ALIGN_OPERATIONS as { operation, label } (operation)}
		<SvelteDrawUiButton
			type="normal"
			onclick={() => {
				// [2]
				const selectedIds = editor.getSelectedShapeIds()
				if (selectedIds.length > 1) {
					editor.alignShapes(selectedIds, operation)
				}
			}}
		>
			{label}
		</SvelteDrawUiButton>
	{/each}
	{#each DISTRIBUTE_OPERATIONS as { operation, label } (operation)}
		<SvelteDrawUiButton
			type="normal"
			onclick={() => {
				// [3]
				const selectedIds = editor.getSelectedShapeIds()
				if (selectedIds.length > 2) {
					editor.distributeShapes(selectedIds, operation)
				}
			}}
		>
			{label}
		</SvelteDrawUiButton>
	{/each}
	<SvelteDrawUiButton
		type="normal"
		onclick={() => {
			// [4]
			editor.updateShapes(
				editor.getCurrentPageShapes().flatMap((shape) => {
					const originalPos = originalPositions.get(shape.id)
					return originalPos ? [{ ...shape, ...originalPos }] : []
				})
			)
		}}
	>
		Reset positions
	</SvelteDrawUiButton>
</div>

<!--
[1]
The operation names accepted by `editor.alignShapes` and `editor.distributeShapes`. Listing them
in a typed array lets us render one button per operation.

[2]
`alignShapes` moves the selected shapes so their edges (or centers) line up. It needs at least
two shapes; with fewer there is nothing to align to.

[3]
`distributeShapes` keeps the outermost two shapes where they are and spaces the ones in between
evenly, so it needs at least three shapes to do anything.

[4]
`updateShapes` applies all the position changes in one call, so a single undo restores every
shape.
-->
