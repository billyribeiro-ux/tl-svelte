<script lang="ts">
	import { type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { ClickableShapeUtil } from './ClickableShapeUtil'

	// [1]
	const customShapeUtils = [ClickableShapeUtil]

	// [2]
	function onMount(editor: Editor) {
		editor.createShape({
			type: 'clickable',
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
We define the custom shape utils array outside of the component so it doesn't get recreated
on every render.

[2]
We pass our custom shape util to the SvelteDraw component and create an initial shape on mount
so there's something to interact with right away.

Try it:
- Click the shape to increment the counter
- Drag the shape to move it
- Both work whether or not the shape is selected
*/
-->
