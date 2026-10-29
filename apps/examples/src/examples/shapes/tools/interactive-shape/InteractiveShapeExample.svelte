<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { myInteractiveShape } from './my-interactive-shape-util'

	// There's a guide at the bottom of this file!

	// [1]
	const customShapeUtils = [myInteractiveShape]

	function onMount(editor: Editor) {
		editor.createShape({ type: 'my-interactive-shape', x: 100, y: 100 })
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw shapeUtils={customShapeUtils} {onMount} />
</div>

<!--
/*
[1]
The shape util array is defined outside the component so it keeps the same identity across
renders. See my-interactive-shape-util.ts for the shape itself, which shows how to let a
shape handle its own pointer events (a checkbox and a text input) without the editor
selecting or dragging it.
*/
-->
