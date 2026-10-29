<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { QuickShapeTool } from './QuickShapeTool'

	// The tool and its guide live in QuickShapeTool.ts.
	const tools = [QuickShapeTool]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {tools} initialState="quick-shape" hideUi />
</div>
