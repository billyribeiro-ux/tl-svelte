<script lang="ts">
	import { type Editor, SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomShapeWrapper from './CustomShapeWrapper.svelte'
	import './custom-shape-wrapper.css'
	import { specialShapeId } from './specialShapeId'

	// There's a guide at the bottom of this file!

	// [3]
	const components: TLComponents = {
		ShapeWrapper: CustomShapeWrapper,
	}

	function onMount(editor: Editor) {
		createSomeRandomShapes(editor)

		// [4]
		const timer = editor.timers.setInterval(() => {
			const allShapes = editor.getCurrentPageShapesSorted()
			const randomShape = allShapes[Math.floor(Math.random() * allShapes.length)]
			specialShapeId.set(randomShape.id)
		}, 1000)

		return () => {
			clearInterval(timer)
		}
	}

	function createSomeRandomShapes(editor: Editor) {
		const bounds = editor.getViewportPageBounds()
		for (let i = 0; i < 10; i++) {
			editor.createShape({
				type: 'geo',
				x: bounds.x + Math.random() * bounds.width,
				y: bounds.y + Math.random() * bounds.height,
			})
		}
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} {onMount} />
</div>

<!--
/*
Introduction:

Every shape on the canvas is rendered inside a wrapper element that positions it. You can replace
that wrapper with the `ShapeWrapper` component override to add class names, data attributes, or
styling to shapes without changing the shapes themselves. In this example, a red drop shadow moves
to a different random shape every second.

[1]
(specialShapeId.ts) An atom holds the id of the currently "special" shape. Atoms are svelte-draw's reactive state
primitive: anything that reads the atom inside a reactive context re-runs when it changes.

[2]
The custom wrapper. It receives the same props as the default wrapper (`shape`, `isBackground`,
`children`) plus a bindable `ref` that svelte-draw uses to position the element, so it must bind the ref through.

	[a]
	`fromComputed` reads the atom reactively, so only the wrapper for the shape whose status changed
	updates when `specialShapeId` is set.

	[b]
	Rather than reimplementing positioning, we render `DefaultShapeWrapper` and pass an extra
	`class` when this shape is the special one. The class is styled in custom-shape-wrapper.css.

[3]
Pass the wrapper through `components.ShapeWrapper`. Define the object once in the script so it
isn't recreated.

[4]
The interval that picks a new special shape is created with `editor.timers`, so it's cleared
automatically when the editor is disposed; the returned cleanup also runs when the component
unmounts.
*/
-->
