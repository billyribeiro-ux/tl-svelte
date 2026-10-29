<script lang="ts">
	import { type Editor, SvelteDraw, createShapeId } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { Y_SHAPE_TYPE, YShapeUtil } from './YShapeUtil'

	// There's a guide at the bottom of YShapeUtil.ts!

	const customShapes = [YShapeUtil]

	function onMount(editor: Editor) {
		const viewportPageBounds = editor.getViewportPageBounds()
		const centerX = viewportPageBounds.center.x
		const centerY = viewportPageBounds.center.y

		const id = createShapeId()
		editor.createShape({
			id,
			type: Y_SHAPE_TYPE,
			x: centerX - 100,
			y: centerY - 100,
		})
		editor.select(id)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw shapeUtils={customShapes} {onMount} />
</div>
