<script lang="ts">
	import { SvelteDraw, type TLAnyShapeUtilConstructor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { customOverlays, setupBezierEditing } from './bezierEditing'
	import { BezierCurveShapeUtil } from './CubicBezierShape'
	import SneakyUndoRedoWhileEditing from './SneakyUndoRedoWhileEditing.svelte'

	const customShapes: TLAnyShapeUtilConstructor[] = [BezierCurveShapeUtil]
</script>

<div class="svelte-draw__editor">
	<!-- [1] -->
	<SvelteDraw overlayUtils={customOverlays} shapeUtils={customShapes} onMount={setupBezierEditing}>
		<!-- [3] -->
		<SneakyUndoRedoWhileEditing />
	</SvelteDraw>
</div>

<!--
/*
Introduction:
This example creates a cubic bezier curve shape with draggable handles. The shape itself lives
in CubicBezierShape.ts; this file wires up the editor so the curve stays in its editing state
while its handles are dragged.

[1]
The default shape handle overlay only shows handles in select.idle and select.pointing_handle.
BezierShapeHandleOverlayUtil replaces it (same `type`, 'shape_handle') and also shows handles
for bezier curves while they're being edited or while a handle is being dragged, so the handles
don't disappear mid-interaction. Other shapes fall through to the default behaviour.

[2]
The select tool's child states normally return to select.idle after a handle drag, which would
end editing. Rather than fork the whole select tool, we grab the state nodes with
`getStateDescendant` and wrap their event handlers, delegating back to the originals for any
shape that isn't a bezier curve. The wrapped handlers add three interactions:
1. Cmd/ctrl + click on a cp1/cp2 handle collapses it onto its start/end point.
2. After dragging any handle, return to select.editing_shape instead of select.idle.
3. Dragging the curve itself while editing translates it, then returns to editing.
Patching state nodes like this is a workaround, not a supported API: it depends on the select
tool's internal state ids and event flow.

[3]
Undo/redo shortcuts are ignored while a shape is being edited, because for text shapes the text
editor owns them. SneakyUndoRedoWhileEditing listens for cmd/ctrl+z at the window level and
restores the editing shape afterwards. It's a hack, but a small one.
*/
-->
