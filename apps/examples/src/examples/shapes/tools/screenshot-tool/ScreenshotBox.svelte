<script lang="ts">
	import { Box, fromComputed, getEditor } from 'svelte-draw'
	import type { ScreenshotDragging } from './ScreenshotTool/childStates/Dragging'

	const editor = getEditor()

	const screenshotBrush = fromComputed('screenshot brush', () => {
		if (editor.getPath() !== 'screenshot.dragging') return null

		const draggingState = editor.getStateDescendant<ScreenshotDragging>('screenshot.dragging')!
		const box = draggingState.screenshotBox.get()

		// The box is in page space, but this component sits in front of the canvas in
		// viewport space, so convert it.
		const zoomLevel = editor.getZoomLevel()
		const { x, y } = editor.pageToViewport({ x: box.x, y: box.y })
		return new Box(x, y, box.w * zoomLevel, box.h * zoomLevel)
	})
</script>

{#if screenshotBrush.current}
	<div
		style="position: absolute; top: 0; left: 0; transform: translate({screenshotBrush.current
			.x}px, {screenshotBrush.current.y}px); width: {screenshotBrush.current
			.w}px; height: {screenshotBrush.current
			.h}px; border: 1px solid var(--tl-color-text-0); z-index: 999;"
	></div>
{/if}
