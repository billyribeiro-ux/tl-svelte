<script lang="ts" module>
	import { type TLEditorComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomBackground from './CustomBackground.svelte'

	// There's a guide at the bottom of this file!

	// [1]
	const components: TLEditorComponents = {
		Background: CustomBackground,
	}
</script>

<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="custom-components-example" {components} />
</div>

<!--
The `components` prop replaces the background, grid, cursors, shape indicators, and more. See
`TLEditorComponents` for the full list.

[1]
Define the components object outside the component (here in the module script) so it's a stable
reference. Here we replace the `Background` component with a plain div in a light blue color
(see `CustomBackground.svelte`). Passing `null` for a component hides it entirely.
-->
