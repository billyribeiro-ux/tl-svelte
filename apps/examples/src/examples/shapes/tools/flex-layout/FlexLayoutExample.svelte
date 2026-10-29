<script lang="ts">
	import { type Editor, SvelteDraw, type TLComponents, createShapeId } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { FLEX_CONTAINER_GAP, FLEX_CONTAINER_PADDING } from './FlexContainerHelpers'
	import { FlexLayoutShapeUtil } from './FlexLayoutShapeUtil'
	import FlexLayoutToolbar from './FlexLayoutToolbar.svelte'
	import {
		FLEX_LAYOUT_ID,
		FLEX_LAYOUT_SHAPE_TYPE,
		resizeFlexLayoutToChildren,
	} from './flexLayoutLogic'
	import './flex-layout.css'

	// There's a guide at the bottom of this file!

	const shapeUtils = [FlexLayoutShapeUtil]
	const components: TLComponents = { InFrontOfTheCanvas: FlexLayoutToolbar }

	// [8]
	function onMount(editor: Editor) {
		const childA = createShapeId('flex-child-a')
		const childB = createShapeId('flex-child-b')
		const orphanC = createShapeId('flex-orphan-c')
		editor.createShapes([
			{
				id: FLEX_LAYOUT_ID,
				type: FLEX_LAYOUT_SHAPE_TYPE,
				x: 160,
				y: 160,
			},
			{
				id: childA,
				type: 'geo',
				x: FLEX_CONTAINER_PADDING,
				y: FLEX_CONTAINER_PADDING,
				parentId: FLEX_LAYOUT_ID,
				props: { w: 128, h: 72, geo: 'rectangle', color: 'red', fill: 'solid' },
			},
			{
				id: childB,
				type: 'geo',
				x: FLEX_CONTAINER_PADDING + 96 + FLEX_CONTAINER_GAP,
				y: FLEX_CONTAINER_PADDING,
				parentId: FLEX_LAYOUT_ID,
				props: { w: 96, h: 96, geo: 'rectangle', color: 'green', fill: 'solid' },
			},
			{
				id: orphanC,
				type: 'geo',
				x: 480,
				y: 480,
				props: { w: 80, h: 144, geo: 'rectangle', color: 'blue', fill: 'solid' },
			},
		])
		resizeFlexLayoutToChildren(editor, FLEX_LAYOUT_ID)
		editor.select(FLEX_LAYOUT_ID)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} {components} {onMount} />
</div>

<!--
/*
Introduction:

This example shows a frame-like custom shape that uses CSS flexbox to arrange its children.

[1]
Extend TLGlobalShapePropsMap with `FlexContainerLayoutProps` (direction, align, justify) plus
width and height.

[2]
Define the shape type using TLShape with the shape's type as a type argument.

[3]
(flexLayoutLogic.ts, FlexLayoutShape.svelte) Frame-style label geometry and heading component, following the same rotation-aware side logic
as the built-in FrameShapeUtil. `getFlexContainerLabelGeometry` returns a `Rectangle2d` marked
`isLabel` and `excludeFromShapeBounds`, positioned just outside the shape, so clicking the label
selects the layout without the label growing the shape's bounds.

[4]
(FlexLayoutShapeUtil.ts) The shape util. BaseFrameLikeShapeUtil gives us frame-like behavior: clipping children,
reparenting shapes in while they're dragged over the layout, and releasing them when dragged
out. The geometry is an unfilled body plus the label hit area, so clicks on interior padding
pass through to the canvas like a frame.

	[4a]
	Allow resizing, but clamp width and height to the minimum needed to fit all children, padding,
	and gaps. Relayout children when a resize finishes.

	[4b]
	When a child is dragged out to empty page space, reparent it back to the page (as the base
	class would) and shrink the layout around the remaining children.

	[4c]
	On drop, finalize the child order (from the pointer position) and positions. The base class
	has already reparented the dropped shapes during the drag; this override just arranges them.

	[4d]
	Keep the container's size in sync after the layout itself is moved.

[5]
(FlexLayoutShape.svelte) Render the layout shape. A hidden measurement layer runs real CSS flexbox with a placeholder
div per child at the child's size, then a ResizeObserver reads each placeholder's offset and
writes it back to the child shape's x/y. That's what lets the browser do the layout math while
the store stays the source of truth. The effect is skipped while a child is being dragged so
it doesn't fight the pointer.

[6]
(FlexLayoutToolbar.svelte) A contextual toolbar shown when a single layout shape is selected, built from
`SvelteDrawUiContextualToolbar` and `SvelteDrawUiToolbarButton`, with direction, justify, and align
controls. Each change re-runs the layout math from `FlexContainerHelpers.ts` so the children
snap immediately rather than waiting for the ResizeObserver.

[7]
(flexLayoutLogic.ts) Helpers for computing the drop index from the pointer, reparenting dropped shapes with new
fractional indices, relayout, and the drop-in / drop-out indicator lines.

[8]
Mount the editor with a layout containing two children plus a loose shape to drag in.

Visual styles for the shape live in `flex-layout.css`. Size math, axis positioning, and drop
indicator geometry are in `FlexContainerHelpers.ts`.
*/
-->
