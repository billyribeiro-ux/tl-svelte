<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { DYNAMIC_SIZE_TYPE } from './ShapeSizes'
	import { DynamicSizeShapeUtil } from './DynamicSizeShapeUtil'

	// [6]
	const shapeUtils = [DynamicSizeShapeUtil]

	function onMount(editor: Editor) {
		editor.selectAll()
		editor.deleteShapes(editor.getSelectedShapeIds())

		editor.createShape({
			type: DYNAMIC_SIZE_TYPE,
			x: 100,
			y: 100,
		})

		editor.selectAll().zoomToSelection()
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} {onMount} />
</div>

