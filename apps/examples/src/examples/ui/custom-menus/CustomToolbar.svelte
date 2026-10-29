<script lang="ts">
	import {
		createIsToolSelected,
		DefaultToolbar,
		DefaultToolbarContent,
		getEditor,
		getTools,
		SvelteDrawUiButton,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'

	const editor = getEditor()
	const tools = getTools()
	const isRhombusSelected = createIsToolSelected(() => tools.current['rhombus-2'])
</script>

<DefaultToolbar>
	<SvelteDrawUiMenuItem
		{...tools.current['rhombus-2']}
		label="geo-style.rhombus-2"
		isSelected={isRhombusSelected.current}
	/>
	<DefaultToolbarContent />
	<SvelteDrawUiButton
		type="icon"
		onclick={() => {
			editor.selectAll().deleteShapes(editor.getSelectedShapeIds())
		}}
		title="Delete all"
	>
		🧨
	</SvelteDrawUiButton>
</DefaultToolbar>
