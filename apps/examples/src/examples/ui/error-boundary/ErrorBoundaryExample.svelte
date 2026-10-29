<script lang="ts" module>
	import type { TLComponents } from 'svelte-draw'
	import ShapeFallback from './ShapeFallback.svelte'
	import { ErrorShapeUtil } from './ErrorShape'

	// There's a guide at the bottom of this file!

	// [1]
	const shapeUtils = [ErrorShapeUtil]

	// [2]
	const components: TLComponents = {
		ShapeErrorFallback: ShapeFallback,
	}
</script>

<script lang="ts">
	import { SvelteDraw, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	function onMount(editor: Editor) {
		// [3]
		editor.createShape({ type: 'error' })
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} {components} {onMount} />
</div>

<!--
Each shape renders inside its own error boundary, so a shape that throws shows a fallback
instead of taking down the editor. This example customizes that fallback.

[1]
A custom shape whose `component()` always throws. See ErrorShape.ts.

[2]
`ShapeErrorFallback` receives the thrown `error` (see ShapeFallback.svelte). Like `shapeUtils`,
`components` is defined at module level so `<SvelteDraw>` doesn't see a new object every render.

[3]
Create the error shape on mount so the fallback is visible straight away.
-->
