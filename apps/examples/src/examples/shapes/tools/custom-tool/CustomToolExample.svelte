<script lang="ts">
	import { type Editor, StateNode, SvelteDraw, toRichText } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	// There's a guide at the bottom of this file!

	const OFFSET = 12

	// [1]
	class StickerTool extends StateNode {
		static override id = 'sticker'

		// [a]
		override onEnter() {
			this.editor.setCursor({ type: 'cross', rotation: 0 })
		}

		// [b]
		override onPointerDown() {
			const currentPagePoint = this.editor.inputs.getCurrentPagePoint()
			this.editor.createShape({
				type: 'text',
				x: currentPagePoint.x - OFFSET,
				y: currentPagePoint.y - OFFSET,
				props: { richText: toRichText('❤️') },
			})
		}
	}

	// [2]
	const customTools = [StickerTool]

	// Put some helpful text on the canvas
	function onMount(editor: Editor) {
		editor.createShape({
			type: 'text',
			x: 100,
			y: 100,
			props: { richText: toRichText('Click anywhere to add a sticker') },
		})
	}
</script>

<div class="svelte-draw__editor">
	<!-- Pass in the array of custom tool classes; set the initial state to the sticker tool; hide the ui -->
	<SvelteDraw tools={customTools} initialState="sticker" hideUi {onMount} />
</div>

<!--
/*
Introduction:

Tools are nodes in svelte-draw's state machine. They are responsible for handling user input.
You can create custom tools by extending the `StateNode` class and overriding its methods.
In this example we make a very simple sticker tool that adds a heart emoji to the canvas
when you click.

[1]
We extend the `StateNode` class to create a new tool called `StickerTool`. We set its id
to "sticker". We are not implementing any child states in this example, so we don't need
to set an initial state or define any children states. To see an example of a custom tool
with child states, check out the screenshot tool example.

	[a] The onEnter method is called when the tool is activated. We use it to set the cursor
		to a crosshair.

	[b] The onPointerDown method is called when the user presses on the canvas. We create a
		text shape at the pointer's page-space position, read from `editor.inputs`, offset so
		the emoji is centered under the cursor.

[2]
We pass our custom tool to the SvelteDraw component using the `tools` prop. We also set the
initial state to our custom tool. We hide the ui and add some helpful text to the canvas
using the `onMount` prop. This is not necessary for the tool to work but it helps make the
example more visually clear.
*/
-->
