<script lang="ts">
	import { type Editor, SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './performance-hooks.css'
	import PerfPanel from './PerfPanel.svelte'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		InFrontOfTheCanvas: PerfPanel,
	}

	function handleMount(editor: Editor) {
		editor.createShapes([
			{ type: 'geo', x: 100, y: 100, props: { w: 200, h: 200, fill: 'solid' } },
			{ type: 'geo', x: 400, y: 100, props: { w: 150, h: 150, geo: 'ellipse', fill: 'solid' } },
			{ type: 'geo', x: 200, y: 350, props: { w: 250, h: 100, geo: 'diamond', fill: 'solid' } },
		])
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={handleMount} {components} />
</div>

<!--
[1]
The panel lives in the `InFrontOfTheCanvas` slot so it can use `getEditor()`. It shows only the most
recent event; each new one replaces the last.

[2]
`editor.performance.on('interaction-end', fn)` fires when any interaction completes (translate,
resize, rotate, draw, and so on). `camera-end` fires once panning or zooming has settled. Both carry
frame time stats (avg, p95, p99, fps) plus context such as shape counts and zoom level. `on` returns
an unsubscribe function, which the effect cleanup calls.

[3]
`PerformanceApiAdapter` mirrors the same events into the browser's Performance API with
`performance.mark()` and `performance.measure()`. Record in the DevTools performance tab while
interacting and you'll see measures like `svelte-draw:interaction:translating` in the timings lane. It's
optional; dispose it when you're done.
-->
