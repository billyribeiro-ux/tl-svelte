<script lang="ts">
	import { SVGContainer, fromComputed, getEditor } from 'svelte-draw'
	import { getAnnotator } from './annotatorContext'

	const editor = getEditor()
	const { imageShapeId } = getAnnotator()

	// [5]
	const path = fromComputed('image bounds overlay path', () => {
		const imagePageBounds = editor.getShapePageBounds(imageShapeId)
		if (!imagePageBounds) return null

		const viewport = editor.getViewportScreenBounds()
		const topLeft = editor.pageToViewport(imagePageBounds)
		const bottomRight = editor.pageToViewport({ x: imagePageBounds.maxX, y: imagePageBounds.maxY })

		return [
			// trace around the viewport
			`M ${-10} ${-10}`,
			`L ${viewport.maxX + 10} ${-10}`,
			`L ${viewport.maxX + 10} ${viewport.maxY + 10}`,
			`L ${-10} ${viewport.maxY + 10}`,
			`Z`,
			// then cut out a hole for the image
			`M ${topLeft.x} ${topLeft.y}`,
			`L ${bottomRight.x} ${topLeft.y}`,
			`L ${bottomRight.x} ${bottomRight.y}`,
			`L ${topLeft.x} ${bottomRight.y}`,
			`Z`,
		].join(' ')
	})
</script>

{#if path.current}
	<SVGContainer class="ImageOverlayScreen">
		<path d={path.current} fill-rule="evenodd" />
	</SVGContainer>
{/if}

<!--
[5]
Only the image bounds are exported, so an even-odd SVG path in screen space dims everything
outside the image. `fromComputed` updates it as the camera moves.
-->
