<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import SelectionUi from './SelectionUi.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		InFrontOfTheCanvas: SelectionUi,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="selection-ui-example" {components} />
</div>

<!--
This example adds four "duplicate in this direction" buttons around the current
selection, rendered in the InFrontOfTheCanvas slot.

[1]
InFrontOfTheCanvas renders in screen space above the canvas, so it doesn't
scale with the camera (SelectionUi.svelte). That makes it the right place for controls that should
stay a fixed size while following the selection. The slot's wrapper has
`pointer-events: none` and already marks pointer events as handled, so we only
need to opt our container back in with `pointer-events: all`.

[2]
`getSelectionRotatedScreenBounds` gives the selection's bounds in screen space,
already rotated to match the selection. Those coordinates are relative to the
whole window, so we subtract the viewport's screen position to get coordinates
relative to the svelte-draw component. Reading everything inside `fromComputed` keeps
the buttons glued to the selection as it moves, rotates, or the camera pans.

[3]
Each button's `rotation` sets both its CSS rotation and the direction the copies
are offset in, zeroed to the right (DuplicateInDirectionButton.svelte).

[4]
To offset the copies by exactly one selection-width plus padding in the chosen
direction, we cast a ray from the selection's center and find where it exits the
padded, rotated selection bounds. Doubling that distance lands the duplicates
just past the original in that direction.
-->
