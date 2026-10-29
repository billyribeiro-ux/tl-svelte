<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import ToolbarGroupsToolbar from './ToolbarGroupsToolbar.svelte'

	// [1]
	const components: TLComponents = {
		Toolbar: ToolbarGroupsToolbar,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
[1]
The toolbar component reads the shared `toolbarState` (see `toolbarState.svelte.ts`) so
the components object can be a stable module-level value. Everything else in the toolbar
comes from the built-in `*ToolbarItem` components, which read the tools from context.
-->
