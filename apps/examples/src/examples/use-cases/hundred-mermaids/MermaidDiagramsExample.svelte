<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './hundred-mermaids.css'
	import MermaidTopPanel from './MermaidTopPanel.svelte'

	const components: TLComponents = {
		TopPanel: MermaidTopPanel,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>
