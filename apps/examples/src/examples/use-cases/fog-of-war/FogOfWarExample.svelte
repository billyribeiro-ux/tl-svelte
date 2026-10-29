<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import Fog from './Fog.svelte'

	const components: TLComponents = {
		InFrontOfTheCanvas: Fog,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="fog-of-war-example" {components} />
</div>
