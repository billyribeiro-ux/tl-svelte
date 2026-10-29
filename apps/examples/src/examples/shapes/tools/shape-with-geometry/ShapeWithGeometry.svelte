<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { HouseShapeUtil } from './ShapeWithGeometryUtil'

	const shapeUtils = [HouseShapeUtil]

	function onMount(editor: Editor) {
		editor.createShape({
			type: 'house',
			x: 100,
			y: 100,
			props: {
				w: 100,
				h: 100,
			},
		})
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {onMount} {shapeUtils} />
</div>

<!--
/*
This file shows a shape with custom (non-rectangular) geometry: a house with a door.

[1]
getGeometry returns the geometry the editor uses for hit testing, selection bounds,
snapping, and arrow binding. It does not have to match a rectangle: here the house body
is a Polygon2d and the door is a Rectangle2d, combined into a Group2d. Because the
geometry is a polygon rather than the bounding box, clicking in the empty corners
either side of the roof does not select the shape.

[2]
The component draws the same vertices as an SVG path. Vec's toString() gives "x, y", so
joining the vertices produces valid path data. The tl-svg-container class sizes the svg
to the shape and turns off pointer events on it.

[3]
getIndicatorPath returns a Path2D for the same outline; svelte-draw strokes it onto the canvas
overlay as the blue selection outline.

[4]
Both the geometry and the rendering derive from getHouseVertices, so hit testing always
matches what the user sees. Keep them in sync when you change how a shape looks.
*/
-->
