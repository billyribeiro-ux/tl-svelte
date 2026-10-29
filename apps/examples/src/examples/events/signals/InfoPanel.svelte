<script lang="ts">
	import { fromComputed, getEditor, quickReactor } from '@svelte-draw/svelte'

	const editor = getEditor()

	// [1]
	const tool = fromComputed('current tool', () => editor.getCurrentToolId())
	const zoom = fromComputed('zoom', () => editor.getZoomLevel().toFixed(2))

	// [2]
	$effect(() =>
		quickReactor('change title', () => {
			const shapes = editor.getCurrentPageShapes()
			document.title = `shapes: ${shapes.length}`
		})
	)
</script>

<div class="tlui-menu" style="font-size: 14px; padding: 8px;">
	<div>tool: {tool.current}</div>
	<div>zoom: {zoom.current}</div>
</div>
