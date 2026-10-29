<script lang="ts">
	import { createShapeId, SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './align-and-distribute-shapes.css'
	import ControlPanel from './ControlPanel.svelte'
	import { originalPositions } from './originalPositions'

	// There's a guide at the bottom of this file!

	// [1]
	const components: TLComponents = {
		TopPanel: ControlPanel,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		onMount={(editor) => {
			const shapes = [
				{
					id: createShapeId(),
					type: 'geo' as const,
					x: 100,
					y: 100,
					props: { w: 100, h: 100, color: 'blue' as const },
				},
				{
					id: createShapeId(),
					type: 'geo' as const,
					x: 300,
					y: 200,
					props: { w: 120, h: 80, color: 'red' as const },
				},
				{
					id: createShapeId(),
					type: 'geo' as const,
					x: 500,
					y: 150,
					props: { w: 80, h: 120, color: 'green' as const },
				},
				{
					id: createShapeId(),
					type: 'geo' as const,
					x: 150,
					y: 400,
					props: { w: 100, h: 100, color: 'violet' as const },
				},
				{
					id: createShapeId(),
					type: 'geo' as const,
					x: 400,
					y: 450,
					props: { w: 90, h: 90, color: 'orange' as const },
				},
			]

			originalPositions.clear()
			for (const shape of shapes) {
				originalPositions.set(shape.id, { x: shape.x, y: shape.y })
			}

			editor.createShapes(shapes)
			editor.selectAll()
		}}
		{components}
	/>
</div>

<!--
The button handlers and the explanation of each align/distribute call are in ControlPanel.svelte.

[1]
Define `components` once, in the instance script or at module level, so the `TopPanel` component
identity stays stable. The panel reads the editor with `getEditor()`.
-->
