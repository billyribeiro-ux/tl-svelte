<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'

	const editor = getEditor()

	// [1], [2], [3]: see the guide in SelectionBoundsExample.svelte
	const view = fromComputed('selection bounds view', () => {
		const axisAlignedBounds = editor.getSelectionPageBounds() // [1]
		const rotatedBounds = editor.getSelectionRotatedPageBounds() // [2]

		if (!axisAlignedBounds || !rotatedBounds) return null

		// [3]
		const zoom = editor.getZoomLevel()
		const rotation = editor.getSelectionRotation()
		const axisAlignedViewportPoint = editor.pageToViewport(axisAlignedBounds.point)
		const rotatedViewportPoint = editor.pageToViewport(rotatedBounds.point)

		return {
			axis: {
				width: axisAlignedBounds.width * zoom,
				height: axisAlignedBounds.height * zoom,
				transform: `translate(${axisAlignedViewportPoint.x}px, ${axisAlignedViewportPoint.y}px)`,
			},
			rotated: {
				width: rotatedBounds.width * zoom,
				height: rotatedBounds.height * zoom,
				transform: `translate(${rotatedViewportPoint.x}px, ${rotatedViewportPoint.y}px) rotate(${rotation}rad)`,
			},
		}
	})
	const current = $derived(view.current)
</script>

{#if current}
	<div
		class="selection-bounds-box selection-bounds-box--axis"
		style:width="{current.axis.width}px"
		style:height="{current.axis.height}px"
		style:transform={current.axis.transform}
	></div>
	<div
		class="selection-bounds-box selection-bounds-box--rotated"
		style:width="{current.rotated.width}px"
		style:height="{current.rotated.height}px"
		style:transform={current.rotated.transform}
	></div>
{/if}
