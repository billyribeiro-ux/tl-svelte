<script lang="ts">
	import { createShapeId, type Editor, SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './z-order.css'
	import ZOrderControls from './ZOrderControls.svelte'

	// There's a guide at the bottom of this file!

	const COLORS = ['red', 'blue', 'green', 'orange'] as const
	const SHAPE_SIZE = 150
	const OVERLAP = 110

	const components: TLComponents = {
		TopPanel: ZOrderControls,
	}

	function handleMount(editor: Editor) {
		if (editor.getCurrentPageShapeIds().size > 0) return

		editor.createShapes(
			COLORS.map((color, i) => ({
				id: createShapeId(),
				type: 'geo' as const,
				x: 200 + i * (SHAPE_SIZE - OVERLAP),
				y: 200 + i * (SHAPE_SIZE - OVERLAP),
				props: {
					w: SHAPE_SIZE,
					h: SHAPE_SIZE,
					color,
					fill: 'solid' as const,
				},
			}))
		)

		editor.zoomToFit({ animation: { duration: 0 } })
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={handleMount} {components} />
</div>

<!--
[1]
`sendToBack` and `bringToFront` move shapes to the very bottom or top of their parent. `sendBackward`
and `bringForward` shift them one step, and by default only past shapes they overlap, which is what
you want from a UI button: moving past a shape on the other side of the page would look like nothing
happened. Pass `{ considerAllShapes: true }` to move exactly one position in the z-order regardless.

When several shapes are selected, their relative order is preserved, so they move as a block.
-->
