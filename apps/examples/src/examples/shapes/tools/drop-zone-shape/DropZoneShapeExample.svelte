<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { DropZoneShapeUtil } from './drop-zone-shape-util'
	import './drop-zone-shape.css'

	// There's a guide at the bottom of this file!

	// [1]
	const customShapeUtils = [DropZoneShapeUtil]

	function onMount(editor: Editor) {
		editor.createShape({ type: 'drop-zone', x: 100, y: 100 })
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw shapeUtils={customShapeUtils} {onMount} />
</div>

<!--
/*
[1]
The shape util array is defined outside the component so it keeps the same identity across
renders. See drop-zone-shape-util.ts for the shape itself, which shows how to let a shape
accept dropped files instead of the canvas.
*/
-->
