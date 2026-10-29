<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { MyCounterShapeUtil, MyGridShapeUtil } from './DragAndDropShapeUtils'

	const shapeUtils = [MyGridShapeUtil, MyCounterShapeUtil]

	function onMount(editor: Editor) {
		if (editor.getCurrentPageShapeIds().size > 0) return
		editor.createShape({ type: 'my-grid-shape', x: 100, y: 100 })
		editor.createShape({ type: 'my-counter-shape', x: 700, y: 100 })
		editor.createShape({ type: 'my-counter-shape', x: 750, y: 200 })
		editor.createShape({ type: 'my-counter-shape', x: 770, y: 300 })
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} {onMount} />
</div>

<!--
/*
[1]
(DragAndDropShapeUtils.ts) First, we extend TLGlobalShapePropsMap to add our shapes' props to the global type system. The grid
has a width and height; the counter has no props at all, so we use Record<string, never>.

[2]
Define the shape types using TLShape with each shape's type as a type argument.

[3]
The counter is a plain ShapeUtil with fixed size: resizing is disabled and the geometry is a filled
Circle2d, so hit-testing follows the circle rather than its bounding box.

[4]
The grid extends BaseFrameLikeShapeUtil, which provides everything a container needs: it reparents
shapes dropped onto it in onDragShapesIn, reparents them back to the page in onDragShapesOut, clips
its children to its geometry, and treats itself as a frame for selection and erasing.

[5]
canReceiveNewChildrenOfType gates which shape types can be dropped in. The editor only calls
onDragShapesIn for shapes that pass this check. Here only counters are accepted, so dragging a geo
shape over the grid does nothing.

[6]
canRemoveChildrenOfType gates which children can be dragged out. When it returns false the editor
doesn't call onDragShapesOut and doesn't reparent the child when it's moved outside the parent's
geometry, so counters are pinned to the grid once dropped.

[7]
The grid draws its slots with CSS gradients. Because BaseFrameLikeShapeUtil clips children to the
grid's geometry, a pinned counter dragged past the edge stays a child and is clipped at the border,
which makes it obvious that it still belongs to the grid.
*/
-->
