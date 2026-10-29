<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import StampPanel from './StampPanel.svelte'
	import { StampTool } from './StampTool'
	import './stamp-tool.css'

	// There's a guide at the bottom of StampTool.ts!

	const components: TLComponents = {
		TopPanel: StampPanel,
	}

	const tools = [StampTool]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {tools} {components} />
</div>
