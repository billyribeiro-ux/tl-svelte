<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { ResizableShapeUtil } from './ResizableShapeUtil'

	// [1]
	const customShapeUtils = [ResizableShapeUtil]

	// [2]
	function onMount(editor: Editor) {
		editor.createShape({
			type: 'resizable',
			x: 200,
			y: 200,
		})
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw shapeUtils={customShapeUtils} {onMount} />
</div>

<!--
/*
[1]
We define the custom shape utils array outside of the component so it doesn't get
recreated on every render.

[2]
We pass our custom shape util to the SvelteDraw component and create an initial shape
on mount so there's something to interact with right away.

Try it:
- Select the shape, then double-click one of its edge resize handles
- The shape toggles between 400×320 and 200×200
*/
-->
