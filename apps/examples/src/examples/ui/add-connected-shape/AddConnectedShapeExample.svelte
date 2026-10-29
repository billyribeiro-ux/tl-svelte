<script lang="ts" module>
	import type { TLComponents } from 'svelte-draw'
	import AddConnectedShapeButtons from './AddConnectedShapeButtons.svelte'

	const components: TLComponents = {
		InFrontOfTheCanvas: AddConnectedShapeButtons,
	}
</script>

<script lang="ts">
	import { SvelteDraw, createShapeId, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './add-connected-shape.css'

	// There's a guide at the bottom of addConnectedShape.ts and AddConnectedShapeButtons.svelte!

	function handleMount(editor: Editor) {
		if (editor.getCurrentPageShapeIds().size > 0) return

		const id = createShapeId()
		const { x, y } = editor.getViewportPageBounds().center
		editor.createShape({
			id,
			type: 'geo',
			x: x - 80,
			y: y - 50,
			props: { w: 160, h: 100, fill: 'semi', color: 'light-blue' },
		})
		editor.select(id)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} onMount={handleMount} />
</div>

<!--
This example shows how to add "plus" buttons around a selected shape that create
a new connected shape in that direction, similar to quick-connect affordances in
tools like Figma and FigJam.

[1]-[4] are in addConnectedShape.ts.

[5]
The buttons are rendered in the `InFrontOfTheCanvas` component slot: above the
canvas, below the rest of the UI. The component reads the selection, camera, and
state chart through `fromComputed` so it updates when any of them change. We only show the
buttons when exactly one non-arrow shape is selected and the select tool is
idle, so they disappear while translating, resizing, or pointing.

[6]
The shape's page bounds are converted to viewport (screen) coordinates with
`pageToViewport`, and each button is pushed a fixed number of screen pixels
away from the edge so the buttons stay the same size at any zoom level. This
example uses the shape's axis-aligned page bounds, so the buttons stay upright
even when the shape is rotated.
-->
