<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import MermaidPasteHandler from './MermaidPasteHandler.svelte'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw>
		<MermaidPasteHandler />
	</SvelteDraw>
</div>
