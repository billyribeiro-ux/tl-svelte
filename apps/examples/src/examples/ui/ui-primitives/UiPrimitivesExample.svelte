<script lang="ts" module>
	import { type TLEditorComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './ui-primitives.css'
	import UiShowcase from './UiShowcase.svelte'

	// [2]
	const components: TLEditorComponents = {
		OnTheCanvas: UiShowcase,
	}
</script>

<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="ui-primitives-example" {components} />
</div>

<!-- [1] The showcase itself is in `UiShowcase.svelte`. -->
<!--
[1]
A tour of the UI primitives exported from svelte-draw: buttons, dropdown menus,
selects, inputs, sliders, popovers, icons, tooltips, and keyboard shortcut
badges. They all read svelte-draw's CSS variables, so anything you build with them
matches the rest of the UI (including dark mode). The showcase calls
`editor.markEventAsHandled` on pointer down (in a native listener) so clicks on the controls don't also
reach the canvas.

[2]
The showcase is rendered in the `OnTheCanvas` slot, so it scales with the
camera. That's deliberate: zoom in to inspect the components at different
sizes. The primitives need the UI context that `<SvelteDraw />` provides, so they
must be rendered inside it (a `components` slot, or as children).
-->
