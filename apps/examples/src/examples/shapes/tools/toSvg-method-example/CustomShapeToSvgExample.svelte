<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { MY_CUSTOM_SHAPE_TO_SVG_TYPE, MyShapeUtil } from './CustomShapeToSvgUtil'

	const customShape = [MyShapeUtil]

	function onMount(editor: Editor) {
		editor.createShape({ type: MY_CUSTOM_SHAPE_TO_SVG_TYPE, x: 100, y: 100 })
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw shapeUtils={customShape} {onMount} />
</div>
