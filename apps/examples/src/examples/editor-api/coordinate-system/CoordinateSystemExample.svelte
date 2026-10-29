<script lang="ts">
	import { SvelteDraw, type TLEditorComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './coordinate-system.css'
	import InFrontOfTheCanvas from './InFrontOfTheCanvas.svelte'

	// There's a guide at the bottom of this file!

	// [6]
	const components: TLEditorComponents = { InFrontOfTheCanvas }
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="coordinate-transformations" {components} />
</div>

<!--
The editor works with three coordinate systems:

- Screen space: browser pixels, as reported by DOM events (`clientX`, `clientY`).
- Viewport space: pixels relative to the top-left of the editor's container. This is what
  you use to position DOM elements inside the editor.
- Page space: the infinite canvas that shapes live in. Panning and zooming change how page
  space maps to the other two.

`screenToPage`, `pageToScreen`, and `pageToViewport` convert between them.

[1]
CoordinateDebugPanel.svelte prints the pointer position in each system, plus the viewport bounds.
It's rendered in the `InFrontOfTheCanvas` slot so it sits over the canvas but doesn't move with it.

[2]
`editor.inputs.getCurrentPagePoint()` is a reactive signal that updates on every pointer move, so
reading it inside `fromComputed` keeps the readout live. We convert it back to the other two spaces
with `pageToScreen` and `pageToViewport`. Going the other way, `screenToPage` turns a DOM event's
`clientX`/`clientY` into a page point.

[3]
`getViewportScreenBounds()` is the editor container's rectangle in screen space, so it only
changes when the container moves or resizes. `getViewportPageBounds()` is the region of the page
currently visible, so it changes whenever you pan or zoom.

[4]
SelectedShapeOverlay.svelte is a label positioned above the selected shape.
`getOnlySelectedShapeId()` returns null unless exactly one shape is selected.

[5]
Elements inside `InFrontOfTheCanvas` are positioned relative to the editor container, so we use
`pageToViewport`, not `pageToScreen`. `pageToScreen` includes the container's offset from the
browser origin, which would push the label off target whenever the editor isn't at (0, 0), for
example next to a sidebar.

[6]
Both pieces are combined in InFrontOfTheCanvas.svelte, since the slot takes a single component.
-->
