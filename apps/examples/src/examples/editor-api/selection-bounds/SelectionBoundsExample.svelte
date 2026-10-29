<script lang="ts">
	import { type Editor, SvelteDraw, createShapeId, toRichText, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './selection-bounds.css'
	import BoundsKey from './BoundsKey.svelte'
	import SelectionBoundsOverlay from './SelectionBoundsOverlay.svelte'

	// There's a guide at the bottom of this file!

	const DEMO_IDS = {
		blue: createShapeId('selection-bounds-blue'),
		greenA: createShapeId('selection-bounds-green-a'),
		greenB: createShapeId('selection-bounds-green-b'),
		greenGroup: createShapeId('selection-bounds-green-group'),
		purple: createShapeId('selection-bounds-purple'),
		red: createShapeId('selection-bounds-red'),
		hint: createShapeId('selection-bounds-hint'),
	} as const

	const ALL_DEMO_IDS = Object.values(DEMO_IDS)
	const SAME_ROTATION = Math.PI / 6

	const DEMO_SHAPES: Parameters<Editor['createShapes']>[0] = [
		{
			id: DEMO_IDS.blue,
			type: 'geo' as const,
			x: 120,
			y: 250,
			rotation: SAME_ROTATION,
			props: {
				geo: 'rectangle' as const,
				w: 180,
				h: 110,
				color: 'blue' as const,
				fill: 'semi' as const,
				dash: 'draw' as const,
			},
		},
		{
			id: DEMO_IDS.greenA,
			type: 'geo' as const,
			x: 430,
			y: 205,
			props: {
				geo: 'rectangle' as const,
				w: 140,
				h: 80,
				color: 'green' as const,
				fill: 'semi' as const,
				dash: 'solid' as const,
			},
		},
		{
			id: DEMO_IDS.greenB,
			type: 'geo' as const,
			x: 610,
			y: 245,
			props: {
				geo: 'rectangle' as const,
				w: 120,
				h: 70,
				color: 'green' as const,
				fill: 'semi' as const,
				dash: 'solid' as const,
			},
		},
		{
			id: DEMO_IDS.purple,
			type: 'geo' as const,
			x: 880,
			y: 205,
			rotation: Math.PI / 8,
			props: {
				geo: 'rectangle' as const,
				w: 130,
				h: 80,
				color: 'violet' as const,
				fill: 'semi' as const,
				dash: 'solid' as const,
			},
		},
		{
			id: DEMO_IDS.red,
			type: 'geo' as const,
			x: 1040,
			y: 260,
			rotation: -Math.PI / 10,
			props: {
				geo: 'rectangle' as const,
				w: 130,
				h: 80,
				color: 'red' as const,
				fill: 'semi' as const,
				dash: 'solid' as const,
			},
		},
	]

	function seedDemoContent(editor: Editor) {
		const existingDemoShapeIds = ALL_DEMO_IDS.filter((id) => editor.getShape(id))

		if (existingDemoShapeIds.length) {
			editor.deleteShapes(existingDemoShapeIds)
		}

		editor.createShapes([
			...DEMO_SHAPES,
			{
				id: DEMO_IDS.hint,
				type: 'text' as const,
				x: 880,
				y: 340,
				props: {
					richText: toRichText('⬆ Select both boxes,\nthen rotate them!'),
					color: 'grey' as const,
					size: 's' as const,
					autoSize: true,
				},
			},
		])
		editor.groupShapes([DEMO_IDS.greenA, DEMO_IDS.greenB], {
			groupId: DEMO_IDS.greenGroup,
			select: false,
		})
		editor.updateShapes([{ id: DEMO_IDS.greenGroup, type: 'group', rotation: SAME_ROTATION }])
		editor.select(DEMO_IDS.blue)
		editor.zoomToFit({ animation: { duration: 0 } })
	}

	const components: TLComponents = {
		InFrontOfTheCanvas: SelectionBoundsOverlay,
		TopPanel: BoundsKey,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="selection-bounds-example"
		{components}
		onMount={(editor) => {
			if (ALL_DEMO_IDS.every((id) => editor.getShape(id))) {
				return
			}

			seedDemoContent(editor)
		}}
	/>
</div>

<!--
The editor keeps two kinds of bounds for the current selection.

[1]
`getSelectionPageBounds()` is the axis-aligned bounding box (blue dashed). It has zero rotation and is
the smallest upright rectangle containing every selected shape. It's used for hit testing and culling,
not for the visible selection UI.

[2]
`getSelectionRotatedPageBounds()` is the rotated selection box (amber solid). When the selected shapes
share one rotation, this box follows it, which is why the resize handles on two equally rotated shapes
line up with the shapes' own axes. When rotations differ there's no sensible shared angle, so it falls
back to the axis-aligned box.

[3]
Both boxes are in page space. `pageToViewport()` converts their origins to viewport pixels, and the sizes
are scaled by the zoom level, so plain HTML elements can be laid over the canvas. The component reads
them through `fromComputed` so it updates whenever the selection or camera changes.

Try selecting each demo:
1. The blue shape: a single rotated shape, where the two boxes differ.
2. The green group: two shapes with a shared rotation, so the rotated box still follows their angle.
3. The purple and red pair: two ungrouped shapes with different rotations, so the rotated box collapses
   to the axis-aligned one. Rotate one of them on its own to see how the axis-aligned box changes while
   the rotated box stays aligned to the page.
-->
