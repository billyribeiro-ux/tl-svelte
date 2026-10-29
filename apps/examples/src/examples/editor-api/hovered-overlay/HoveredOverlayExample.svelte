<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './hovered-overlay.css'
	import HoveredOverlayReadout from './HoveredOverlayReadout.svelte'

	// There's a guide at the bottom of this file!

	// [2]
	const components: TLComponents = {
		TopPanel: HoveredOverlayReadout,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
The editor exposes an `OverlayManager` on `editor.overlays` that tracks every
active canvas overlay — selection handles, resize corners, rotation handles,
shape handles, and so on. It gives you reactive access to the overlay the user
is hovering and hit-testing at an arbitrary page point.

Key methods on `editor.overlays`:

- `getHoveredOverlay()` — the `TLOverlay` currently under the pointer, or null.
  Reactive: updates as the pointer moves.
- `getOverlayAtPoint(point, margin?)` — hit test any page-space point against
  all interactive overlays. Returns the topmost match, or null.
- `getCurrentOverlays()` — every active overlay in paint order.
- `getOverlayGeometry(overlay)` — cached hit-test geometry for an overlay.

[1]
`HoveredOverlayReadout.svelte` reads `editor.overlays.getHoveredOverlay()` through `fromComputed`
so it updates whenever the hovered overlay changes. Select a shape to produce
handles, then hover one to see its type (for example `selection_foreground` or
`shape_handle`) and its id.

[2]
Mount the readout into the `TopPanel` component slot.
-->
