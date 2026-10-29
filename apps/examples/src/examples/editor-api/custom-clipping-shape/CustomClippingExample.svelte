<script lang="ts">
	import {
		createShapeId,
		SvelteDraw,
		toRichText,
		type TLComponents,
		type TLGeoShapeProps,
		type TLTextShapeProps,
		type TLUiOverrides,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { CircleClipShapeTool } from './CircleClipShapeTool'
	import { CircleClipShapeUtil } from './CircleClipShapeUtil'
	import './CustomClipping.css'
	import CustomToolbar from './CustomToolbar.svelte'
	import ToggleClippingButton from './ToggleClippingButton.svelte'

	// There's a guide at the bottom of this file!

	// [1]
	const shapeUtils = [CircleClipShapeUtil]
	const tools = [CircleClipShapeTool]

	// [2]
	const customUiOverrides: TLUiOverrides = {
		tools(editor, tools) {
			tools['circle-clip'] = {
				id: 'circle-clip',
				label: 'Circle clip',
				icon: 'color',
				kbd: 'c',
				onSelect() {
					editor.setCurrentTool('circle-clip')
				},
			}
			return tools
		},
	}

	// [5]
	const components: TLComponents = {
		Toolbar: CustomToolbar,
		InFrontOfTheCanvas: ToggleClippingButton,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{shapeUtils}
		{tools}
		{components}
		overrides={customUiOverrides}
		onMount={(editor) => {
			editor.setCurrentTool('select')

			const clipShapeId = createShapeId()
			editor.createShape({
				id: clipShapeId,
				type: 'circle-clip',
				x: 200,
				y: 200,
				props: {
					w: 300,
					h: 300,
				},
			})

			editor.createShape({
				type: 'text',
				x: 0,
				y: 100,
				parentId: clipShapeId,
				props: {
					size: 'l',
					textAlign: 'middle',
					richText: toRichText('This text is clipped to the circle! ✂️'),
				} satisfies Partial<TLTextShapeProps>,
			})

			editor.createShape({
				type: 'geo',
				x: 100,
				y: 290,
				parentId: clipShapeId,
				props: {
					geo: 'rectangle',
					w: 200,
					h: 100,
					fill: 'solid',
					color: 'blue',
					richText: toRichText('Oops you found me!'),
				} satisfies Partial<TLGeoShapeProps>,
			})

			editor.zoomToFit()
		}}
	/>
</div>

<!--
Any shape can clip its children by implementing `getClipPath` (the polygon, in local space) and
optionally `shouldClipChild` (which children it applies to). See CircleClipShapeUtil.ts for the
shape itself; this file wires it into the editor and UI.

[1]
Define the shape util and tool arrays outside of the render path so they keep the same identity.
A new array would make the editor think its shape utils changed.

[2]
Register the tool with the UI so it has a label, icon, and keyboard shortcut. This is what
`getTools()` returns in CustomToolbar.svelte.

[3]
ToggleClippingButton.svelte flips a module-level atom that every circle's `shouldClipChild` reads,
so one click changes clipping for all circles. It marks pointer down/up as handled with native
listeners, which stops the canvas from treating the click as the start of a selection.

[4]
CustomToolbar.svelte adds the tool to the default toolbar. `createIsToolSelected` highlights it
while it's active.

[5]
Override the toolbar and add the toggle button in the `InFrontOfTheCanvas` slot.

[6]
On mount, create a circle with a text shape and a rectangle as children. Both are partly outside
the circle so the clipping is visible right away.
-->
