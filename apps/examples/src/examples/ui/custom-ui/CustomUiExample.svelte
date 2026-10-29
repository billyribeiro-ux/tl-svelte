<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import CustomUi from './CustomUi.svelte'
	import './custom-ui.css'

	// There's a guide at the bottom of this file!
</script>

<!-- [1] -->
<div class="svelte-draw__editor">
	<SvelteDraw hideUi>
		<CustomUi />
	</SvelteDraw>
</div>

<!--
[1]
We render the `SvelteDraw` component with the `hideUi` prop, which hides the default toolbar, style
panel, menus, and so on. Our custom UI is rendered as a child of `SvelteDraw`, which gives it access to
the editor instance via Svelte context.

The context menu isn't hidden by `hideUi`. If you want to hide it too, render the parts that make
up the `SvelteDraw` component separately and omit the context menu; see the exploded example.
-->
