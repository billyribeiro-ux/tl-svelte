<script lang="ts">
	import { createShapeId, SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './shape-animation.css'
	import AnimationControls from './AnimationControls.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		TopPanel: AnimationControls,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{components}
		onMount={(editor) => {
			const id = createShapeId()
			editor.createShapes([
				{
					id,
					type: 'geo',
					x: 200,
					y: 200,
					props: {
						w: 100,
						h: 100,
						color: 'blue',
					},
				},
				{
					id: createShapeId(),
					type: 'geo',
					x: 400,
					y: 300,
					props: {
						w: 80,
						h: 80,
						color: 'red',
						geo: 'ellipse',
					},
				},
				{
					id: createShapeId(),
					type: 'geo',
					x: 600,
					y: 200,
					props: {
						w: 120,
						h: 90,
						color: 'green',
						geo: 'triangle',
					},
				},
			])
			editor.select(id)
		}}
	/>
</div>

<!--
[1]
`animateShape()` takes a shape partial (here the whole shape spread with new values) plus animation
options, and interpolates `x`, `y`, `rotation`, and `opacity` from the shape's current values to the
targets over `duration`. `easing` accepts any function from `EASINGS`, or your own `(t) => number`.
Props are interpolated too when the shape util implements `getInterpolatedProps`.

[2]
`animateShapes()` does the same for many partials at once, sharing one duration and easing. Starting a
new animation on a shape that's already animating cancels the earlier one for that shape.
-->
