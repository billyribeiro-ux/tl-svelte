<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './popup-shape.css'
	import { PopupShapeUtil } from './PopupShapeUtil'

	const customShapeUtils = [PopupShapeUtil]

	function onMount(editor: Editor) {
		for (let i = 0; i < 9; i++) {
			editor.createShape({
				type: 'my-popup-shape',
				x: (i % 3) * 220,
				y: Math.floor(i / 3) * 220,
			})
		}
		editor.zoomToBounds(editor.getCurrentPageBounds()!, { animation: { duration: 0 } })
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw shapeUtils={customShapeUtils} {onMount} />
</div>
