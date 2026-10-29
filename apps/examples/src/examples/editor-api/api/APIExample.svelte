<script lang="ts">
	import {
		createShapeId,
		type Editor,
		type TLGeoShape,
		SvelteDraw,
		toRichText,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import InsideOfEditorContext, { STEP_MS } from './InsideOfEditorContext.svelte'

	// There's a guide at the bottom of this file!

	// [1]
	const handleMount = (editor: Editor) => {
		const id = createShapeId('hello')

		// Run each API call on its own beat so a viewer can see what each one does.
		// richText is set at creation time; adding a first label later would trigger
		// the geo shape's auto-sizing and swallow the height update in step 2.
		const steps: (() => void)[] = [
			// 1. Create the shape
			() => {
				editor.createShapes([
					{
						id,
						type: 'geo',
						x: 128 + Math.random() * 500,
						y: 128 + Math.random() * 500,
						props: {
							geo: 'rectangle',
							w: 120,
							h: 100,
							dash: 'draw',
							color: 'blue',
							size: 'm',
							richText: toRichText('hello world!'),
						},
					},
				])
			},
			// 2. Triple the shape's height
			() => {
				const shape = editor.getShape<TLGeoShape>(id)!
				editor.updateShape({
					id,
					type: 'geo',
					props: { h: shape.props.h * 3 },
				})
			},
			// 3. Rotate the shape around its center
			() => editor.rotateShapesBy([id], Math.PI / 8),
			// 4. Zoom the camera to fit the shape
			() => editor.zoomToFit(),
			// 5. Select the shape
			() => editor.select(id),
		]

		const timeouts = steps.map((step, i) => setTimeout(step, i * STEP_MS))

		return () => {
			timeouts.forEach(clearTimeout)
		}
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={handleMount}>
		<InsideOfEditorContext />
	</SvelteDraw>
</div>

<!--
Introduction:

This example shows how to use the svelte-draw editor instance to make changes
to the canvas. The editor is svelte-draw's "god object": you can use it to do just
about everything that's possible in svelte-draw. Internally, the canvas component
and all shapes, tools, and UI components use this instance to send events,
observe changes, and perform actions.

There are two main ways to get hold of the editor:

[1]
The SvelteDraw component passes its editor instance to the onMount callback prop.
We schedule each API call on its own beat so a viewer can see the effect of
every step: creating the shape, updating its height, rotating it, zooming the
camera, and selecting it. The cleanup function returned from onMount cancels
any pending steps if the editor unmounts first.

[2]
Any component rendered as a child of SvelteDraw can read the editor from Svelte
context with getEditor() (see InsideOfEditorContext.svelte). Once the timeline above
finishes, this child component takes over and demonstrates two more API calls,
setStyleForSelectedShapes and setStyleForNextShapes, by cycling the shape's
color.
-->
