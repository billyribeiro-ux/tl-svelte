<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './conditional-culling.css'
	import { GLOW_SHAPE_TYPE, GlowShapeUtil } from './GlowShapeUtil'

	// There's a guide at the bottom of this file!

	const shapeUtils = [GlowShapeUtil]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{shapeUtils}
		onMount={(editor) => {
			// [3]
			editor.createShape({
				type: GLOW_SHAPE_TYPE,
				x: 200,
				y: 100,
				props: { preventCulling: true },
			})
			editor.createShape({
				type: GLOW_SHAPE_TYPE,
				x: 200,
				y: 350,
				props: { preventCulling: false },
			})
		}}
	/>
</div>

<!--
Culling hides a shape (`display: none`) once its bounds leave the viewport. Shapes whose visuals
extend past their bounds (glows, drop shadows, other overflow) pop in and out at the viewport
edge when that happens. Returning false from `canCull()` keeps the shape visible off-screen.
The shape util is in GlowShapeUtil.ts.

[3]
Two shapes stacked vertically so you can pan sideways and watch both leave the viewport at once.
The one with "Prevent culling" checked keeps its glow visible past the edge; the other vanishes
as soon as its bounds are off-screen.

Culled shapes skip layout and paint, so only opt out of culling for shapes that genuinely
need it.
-->
