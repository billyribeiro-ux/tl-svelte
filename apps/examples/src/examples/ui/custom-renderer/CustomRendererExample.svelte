<script lang="ts" module>
	import { type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomRenderer from './CustomRenderer.svelte'
	import './custom-renderer.css'

	// There's a guide at the bottom of this file!

	// [1]
	const components: TLComponents = {
		Background: CustomRenderer,
	}
</script>

<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
</script>

<!-- [2] -->
<div class="svelte-draw__editor custom-renderer">
	<SvelteDraw persistenceKey="custom-renderer-example" {components} />
</div>

<!--
The shapes are drawn to a 2d canvas from the editor's shape data instead of being rendered by
Svelte.

[1]
We replace the `Background` component with our custom renderer (see `CustomRenderer.svelte`). It
reads the rendering shapes from the editor on every animation frame and draws them itself. Even
though the DOM shapes are hidden, svelte-draw still does the work of figuring out which shapes to
render. In a real app you might set the `Canvas` component to null and render everything yourself.

[2]
The `.custom-renderer` class hides svelte-draw's regular shapes layer via CSS (see
`custom-renderer.css`) so only our canvas rendering is visible. Selection, handles, and the
rest of the UI still work as normal.
-->
