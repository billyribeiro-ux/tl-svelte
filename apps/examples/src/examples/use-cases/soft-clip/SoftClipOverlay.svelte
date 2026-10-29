<script lang="ts">
	import { getEditor, quickReactor } from 'svelte-draw'
	import type { Attachment } from 'svelte/attachments'
	import { isSoftClipShape } from './softClip'

	let { opacity }: { opacity: number } = $props()

	const editor = getEditor()

	// [1]
	const overlayPath: Attachment<SVGPathElement> = (path) =>
		quickReactor('soft clip overlay', () => {
			const vsb = editor.getViewportScreenBounds()
			const clipShapes = editor.getCurrentPageShapes().filter(isSoftClipShape)

			if (clipShapes.length === 0) {
				path.setAttribute('d', '')
				return
			}

			// [2]
			let d = `M0,0 L${vsb.w},0 L${vsb.w},${vsb.h} L0,${vsb.h} Z`

			for (const shape of clipShapes) {
				const geo = editor.getShapeGeometry(shape)
				const pageTransform = editor.getShapePageTransform(shape)
				if (!pageTransform || geo.vertices.length === 0) continue

				const pagePts = pageTransform.applyToPoints(geo.vertices)
				const screenPts = pagePts.map((p) => editor.pageToScreen(p))

				d += ` M${(screenPts[0].x - vsb.x).toFixed(2)},${(screenPts[0].y - vsb.y).toFixed(2)}`
				for (let i = 1; i < screenPts.length; i++) {
					d += ` L${(screenPts[i].x - vsb.x).toFixed(2)},${(screenPts[i].y - vsb.y).toFixed(2)}`
				}
				d += ' Z'
			}

			path.setAttribute('d', d)
		})
</script>

<svg class="soft-clip-overlay">
	<path {@attach overlayPath} fill-rule="evenodd" fill-opacity={1 - opacity} />
</svg>

<!--
[1]
`quickReactor` re-runs synchronously whenever any of the signals it reads change (shapes,
their geometry, the camera), and writes the path data straight to the DOM so the overlay
never lags the canvas.

[2]
The first subpath is the whole viewport; each clip shape's vertices, transformed to screen
space, add another subpath. With `fill-rule="evenodd"` the inner subpaths are holes, so the
outside is dimmed and the inside is left alone.
-->
