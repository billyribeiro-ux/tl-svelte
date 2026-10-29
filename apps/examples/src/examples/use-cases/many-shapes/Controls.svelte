<script lang="ts">
	import { getEditor, SvelteDrawUiButton } from 'svelte-draw'
	import { generateShapes } from './generateShapes'

	const editor = getEditor()

	const handleGenerate = (count: number) => {
		generateShapes(editor, count)
		editor.zoomToFit({ animation: { duration: 300 } })
	}

	const handleClear = () => {
		editor.deleteShapes([...editor.getCurrentPageShapeIds()])
	}
</script>

<div style="display: flex; gap: 4px; padding: 8px; flex-wrap: wrap;">
	<SvelteDrawUiButton type="normal" onclick={() => handleGenerate(200)}>
		Add 200 shapes
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={() => handleGenerate(500)}>
		Add 500 shapes
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={() => handleGenerate(1000)}>
		Add 1000 shapes
	</SvelteDrawUiButton>
	<SvelteDrawUiButton type="normal" onclick={handleClear}>Clear all</SvelteDrawUiButton>
</div>
