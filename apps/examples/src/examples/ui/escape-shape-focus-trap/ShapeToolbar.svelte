<script lang="ts">
	import {
		Box,
		fromComputed,
		getEditor,
		SvelteDrawUiButtonIcon,
		SvelteDrawUiContextualToolbar,
		SvelteDrawUiToolbarButton,
	} from 'svelte-draw'

	// There's a guide at the bottom of the example file!

	// [1]
	const editor = getEditor()
	const showToolbar = fromComputed(
		'show shape toolbar',
		() => editor.isIn('select.idle') && !!editor.getOnlySelectedShapeId()
	)

	// [2]
	function handleReturn() {
		editor.getContainer().focus()
	}

	// [3]
	function getSelectionBounds() {
		const fullBounds = editor.getSelectionRotatedScreenBounds()
		if (!fullBounds) return undefined
		return new Box(fullBounds.x, fullBounds.y, fullBounds.width, 0)
	}
</script>

{#if showToolbar.current}
	<SvelteDrawUiContextualToolbar {getSelectionBounds} label="Shape actions">
		<SvelteDrawUiToolbarButton
			type="icon"
			title="Duplicate"
			onclick={() => {
				editor.duplicateShapes(editor.getSelectedShapes())
				handleReturn()
			}}
		>
			<SvelteDrawUiButtonIcon small icon="duplicate" />
		</SvelteDrawUiToolbarButton>
		<SvelteDrawUiToolbarButton
			type="icon"
			title="Delete"
			onclick={() => {
				editor.deleteShapes(editor.getSelectedShapeIds())
				handleReturn()
			}}
		>
			<SvelteDrawUiButtonIcon small icon="trash" />
		</SvelteDrawUiToolbarButton>
	</SvelteDrawUiContextualToolbar>
{/if}
