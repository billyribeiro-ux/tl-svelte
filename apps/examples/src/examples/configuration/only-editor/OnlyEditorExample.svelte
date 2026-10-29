<script lang="ts">
	import { SvelteDrawEditor, createShapeId } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import Instructions from './Instructions.svelte'
	import { MiniBoxShapeUtil } from './MiniBoxShape'
	import { MiniSelectTool } from './MiniSelectTool'

	// There's a guide at the bottom of this file!

	// [1]
	const tools = [MiniSelectTool]
	const shapeUtils = [MiniBoxShapeUtil]

	const components = {
		OnTheCanvas: Instructions,
	}
</script>

<!-- [2] -->
<div class="svelte-draw__editor">
	<SvelteDrawEditor
		{tools}
		{shapeUtils}
		{components}
		initialState="select"
		onMount={(editor) => {
			editor
				.selectAll()
				.deleteShapes(editor.getSelectedShapeIds())
				.createShapes([{ id: createShapeId(), type: 'box', x: 100, y: 100 }])
		}}
	/>
</div>

<!--
[1]
SvelteDrawEditor has no built-in shapes or tools, so we supply our own: a box shape util
(MiniBoxShape.ts) and a select tool (MiniSelectTool.ts). MicroSelectTool.ts is an even smaller
select tool without child states; it isn't wired up here but is worth reading first. The custom
config example covers writing shapes and tools in more depth.

[2]
`initialState` names the tool the editor starts in; it must match a tool's `static id`. There is
no UI here, so the instructions are rendered through the `OnTheCanvas` component slot instead.
-->
