<script lang="ts">
	import { SvelteDrawUiButton, SvelteDrawUiButtonLabel, getEditor } from 'svelte-draw'

	const editor = getEditor()

	async function exportCanvas() {
		const shapeIds = editor.getCurrentPageShapeIds()
		if (shapeIds.size === 0) return alert('No shapes on the canvas')
		// [1]
		const { blob } = await editor.toImage([...shapeIds], { format: 'png', background: false })

		// [2]
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = 'every-shape-on-the-canvas.png'
		link.click()
		URL.revokeObjectURL(link.href)
	}
</script>

<div class="tlui-menu" style="pointer-events: all">
	<SvelteDrawUiButton type="normal" onclick={exportCanvas}>
		<SvelteDrawUiButtonLabel>Export canvas as image</SvelteDrawUiButtonLabel>
	</SvelteDrawUiButton>
</div>
