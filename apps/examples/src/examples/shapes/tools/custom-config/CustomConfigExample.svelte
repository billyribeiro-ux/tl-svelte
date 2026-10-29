<script lang="ts">
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { CardShapeTool } from './CardShape/CardShapeTool'
	import { CardShapeUtil } from './CardShape/CardShapeUtil'
	import { components, uiOverrides } from './ui-overrides'

	// There's a guide at the bottom of this file!

	// [1]
	const customShapeUtils = [CardShapeUtil]
	const customTools = [CardShapeTool]
</script>

<!-- [2] -->
<div class="svelte-draw__editor">
	<!-- Pass in the arrays of custom shape and tool classes, and any overrides to the user interface -->
	<SvelteDraw
		shapeUtils={customShapeUtils}
		tools={customTools}
		overrides={uiOverrides}
		{components}
	/>
</div>

<!--
/*
Introduction:

This example shows how to create a custom shape, and add your own icon for it to the toolbar.
Check out CardShapeUtil.ts and CardShapeTool.ts to see how we define the shape util and tool.
Check out ui-overrides.ts for more info on how to add your icon to the toolbar.

[1]
We define arrays to hold the custom shape util and custom tool. It's important to do this once, in
the script, so that the arrays aren't redefined.

[2]
Now we'll pass these arrays into the SvelteDraw component's props, along with our ui overrides.
*/
-->
