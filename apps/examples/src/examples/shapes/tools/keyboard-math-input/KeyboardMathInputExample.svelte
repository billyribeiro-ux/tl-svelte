<script lang="ts">
	import 'katex/dist/katex.min.css'
	import {
		type Editor,
		SvelteDraw,
		type TLComponents,
		type TLUiOverrides,
		createShapeId,
		toRichText,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import MathToolbar from './MathToolbar.svelte'
	import { MathShapeUtil } from './MathShapeUtil'
	import { MathTool } from './MathTool'
	import './keyboard-math-input.css'

	// There's a guide at the bottom of this file!

	const customShapeUtils = [MathShapeUtil]
	const customTools = [MathTool]

	// [1]
	const uiOverrides: TLUiOverrides = {
		tools(editor, tools) {
			tools.math = {
				id: 'math',
				icon: 'tool-math',
				label: 'Math',
				kbd: 'm',
				onSelect: () => editor.setCurrentTool('math'),
			}
			return tools
		},
	}

	const components: TLComponents = { Toolbar: MathToolbar }

	// [2]
	const MATH_ICON =
		'data:image/svg+xml;utf8,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"><text x="15" y="21" font-family="Georgia, serif" font-style="italic" font-size="17" text-anchor="middle">&#8730;x</text></svg>'
		)
	const assetUrls = { icons: { 'tool-math': MATH_ICON } }

	function onMount(editor: Editor) {
		if (editor.getCurrentPageShapes().length > 0) return
		const examples = [
			'x = (-b +- sqrt(b^2 - 4ac))/(2a)',
			'e^(i pi) + 1 = 0',
			'int_0^inf e^(-x^2) dx = sqrt(pi)/2',
		]
		const ids = examples.map((text, i) => {
			const id = createShapeId(`example-${i}`)
			editor.createShape({ id, type: 'math', x: 160, y: 120 + i * 120, props: { text } })
			return id
		})
		editor.createShape({
			type: 'text',
			x: 560,
			y: 150,
			props: {
				richText: toRichText(
					'Pick the √x tool (or press M), then click the canvas\nand just type: 1/2, sqrt(2), x^2, pi\nDouble-click any equation to edit it. Enter when done.'
				),
			},
		})
		// [3]
		editor.timers.setTimeout(() => {
			editor.stackShapes(ids, 'vertical', 32)
			editor.zoomToFit({ animation: { duration: 0 } })
		}, 100)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		shapeUtils={customShapeUtils}
		tools={customTools}
		overrides={uiOverrides}
		{components}
		{assetUrls}
		{onMount}
	/>
</div>

<!--
/*
Math equations as a first-class canvas shape. The shape stores keyboard
shorthand, translates it to LaTeX (see shorthand.ts), and renders it with
KaTeX. While editing, a text input with a live preview appears (see
MathShapeUtil.ts, MathShape.svelte and MathInput.svelte). This file wires up the tool and toolbar.

[1]
Register the math tool with the UI: the overrides object adds it to the
toolbar schema with a keyboard shortcut, and the custom Toolbar component
places its button ahead of the default content.

[2]
svelte-draw renders toolbar icons as CSS masks, so any SVG works and the fill
color is irrelevant. An inline data URL avoids shipping an asset file.

[3]
The math shape sizes itself to its rendered content, so the seeded shapes
only have real heights after their first render. Wait a beat, then stack
them with an even gap and frame the result.
*/
-->
