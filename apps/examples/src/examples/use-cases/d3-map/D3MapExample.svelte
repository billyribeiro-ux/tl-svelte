<script lang="ts">
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './d3-map.css'
	import { createMap } from './map'
	import TopPanel from './TopPanel.svelte'
	import { UsMapShapeUtil } from './UsMapShapeUtil'
	import { UsStateShapeUtil } from './UsStateShapeUtil'

	// [1]
	const shapeUtils = [UsMapShapeUtil, UsStateShapeUtil]

	const components: TLComponents = {
		TopPanel,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		{shapeUtils}
		{components}
		onMount={(editor) => {
			if (editor.getCurrentPageShapeIds().size === 0) {
				createMap(editor)
			}
			editor.zoomToFit({ animation: { duration: 0 } })
		}}
	/>
</div>

<!--
[1]
Two custom shapes: `us-map` renders every state path in one SVG (see UsMapShapeUtil.ts),
and `us-state` renders a single state. Double-clicking the map, or clicking its "Explode
states" button, replaces the map with one `us-state` shape per state.
-->
