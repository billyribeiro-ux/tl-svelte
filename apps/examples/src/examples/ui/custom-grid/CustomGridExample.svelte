<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomGrid from './CustomGrid.svelte'

	// There's a guide at the bottom of this file!

	// [1]
	const components: TLComponents = {
		Grid: CustomGrid,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="custom-grid-example"
		{components}
		onMount={(e) => {
			e.updateInstanceState({ isGridMode: true })
		}}
	/>
</div>

<!--
[1]
To add a custom grid, override the `Grid` component (CustomGrid.svelte). It receives the camera
position and zoom along with the grid size in page space, and updates whenever the camera moves.

[2]
Besides the camera, the grid also needs to redraw when the screen bounds change, when the device
pixel ratio changes, or when the color mode changes. `fromComputed` subscribes to those values so
the drawing effect re-runs when they change.

[3]
To avoid pixelation we render at the device's actual resolution, so the canvas size is scaled by
the device pixel ratio.

[4]
Calculate the first and last grid lines visible in the viewport, in page space, so we only draw
the lines that are actually on screen.

[5]
Convert each page-space line position into canvas pixels using the camera and device pixel ratio.
Major lines are drawn every 10 grid units.

[6]
The `tl-grid` class is important for correct positioning and pointer-event handling.
-->
