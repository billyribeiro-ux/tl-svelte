<script lang="ts">
	import { SvelteDraw, type TLEditorComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import MyComponent from './MyComponent.svelte'
	import MyComponentInFront from './MyComponentInFront.svelte'
	import './things-on-the-canvas.css'

	// There's a guide at the bottom of this file!

	// [3]
	const components: TLEditorComponents = {
		OnTheCanvas: MyComponent,
		InFrontOfTheCanvas: MyComponentInFront,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="things-on-the-canvas-example" {components} />
</div>

<!--
This example shows the two component slots that live inside the canvas:
`OnTheCanvas` and `InFrontOfTheCanvas`. `OnTheCanvas` components behave like
shapes: they scale with the zoom and move when the page is panned.
`InFrontOfTheCanvas` components render in screen space, so they move with the
page but don't scale.

For a component that ignores the camera entirely, put it in a UI slot such as
`TopPanel` or `SharePanel` instead (see the "UI zones" example).

[1] (MyComponent.svelte)
Our `OnTheCanvas` component. Its `top`/`left` are page coordinates. We call
`editor.markEventAsHandled` on pointer down so clicks on the card don't also
reach the canvas and start a selection or brush.

[2] (MyComponentInFront.svelte)
Our `InFrontOfTheCanvas` component. We want it to sit next to the selection,
so we read the selection bounds inside `fromComputed`; the component updates
whenever the selection or the camera changes. `editor.pageToViewport` converts
the page-space point into viewport (screen) coordinates.

[3]
Define the components object once at module level, so `<SvelteDraw>` doesn't see a
new object on every render.
-->
