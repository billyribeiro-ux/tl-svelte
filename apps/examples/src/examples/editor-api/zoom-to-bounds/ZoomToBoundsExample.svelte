<script lang="ts">
	import { createShapeId, type Editor, SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './zoom-to-bounds.css'
	import { zoomBox1, zoomBox2 } from './boxes'
	import ZoomControls from './ZoomControls.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		TopPanel: ZoomControls,
	}

	function handleMount(editor: Editor) {
		editor.createShapes([
			{
				id: createShapeId(),
				type: 'geo',
				x: zoomBox1.x,
				y: zoomBox1.y,
				isLocked: true,
				props: { w: zoomBox1.w, h: zoomBox1.h, color: 'violet' },
			},
			{
				id: createShapeId(),
				type: 'geo',
				x: zoomBox2.x,
				y: zoomBox2.y,
				isLocked: true,
				props: { w: zoomBox2.w, h: zoomBox2.h, color: 'blue' },
			},
		])
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={handleMount} {components} />
</div>

<!--
[1]
`zoomToBounds` fits the given page-space box into the viewport. The camera keeps the viewport's aspect
ratio, so the visible area is usually larger than the box you pass on one axis. `inset` is screen-space
padding around the box; when omitted the editor uses `options.zoomToFitPadding` (capped relative to the
viewport width). Pass `animation` to animate the move; without it the camera jumps.
-->
