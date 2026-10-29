<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import ContextualStylePanel from './ContextualStylePanel.svelte'

	// There's a guide at the bottom of ContextualStylePanel.svelte!

	// [10]
	const components: TLComponents = {
		StylePanel: null,
		InFrontOfTheCanvas: ContextualStylePanel,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>
