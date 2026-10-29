<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import SnowStorm from './SnowStorm.svelte'
	import './snowstorm.css'
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="snowstorm-example">
		<!-- Children of SvelteDraw render inside the editor container, above the canvas -->
		<SnowStorm />
	</SvelteDraw>
</div>
