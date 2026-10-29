<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { MyShapeUtil } from './ShapeWithSvelteDrawStylesUtil'

	const customShapeUtils = [MyShapeUtil]

	function onMount(editor: Editor) {
		editor.createShape({ type: 'myshapewithsvelte-drawstyles', x: 100, y: 100 })
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw shapeUtils={customShapeUtils} {onMount} />
</div>

