<script lang="ts">
	import {
		SvelteDraw,
		type TLComponents,
		type TLUiAssetUrlOverrides,
		type TLUiOverrides,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import ScreenshotBox from './ScreenshotBox.svelte'
	import { ScreenshotTool } from './ScreenshotTool/ScreenshotTool'
	import ScreenshotToolbar from './ScreenshotToolbar.svelte'

	// There's a guide at the bottom of this file!

	// [1]
	const customTools = [ScreenshotTool]

	// [2]
	const customUiOverrides: TLUiOverrides = {
		tools: (editor, tools) => {
			return {
				...tools,
				screenshot: {
					id: 'screenshot',
					label: 'Screenshot',
					icon: 'tool-screenshot',
					kbd: 'j',
					onSelect() {
						editor.setCurrentTool('screenshot')
					},
				},
			}
		},
	}

	// [3]
	const customAssetUrls: TLUiAssetUrlOverrides = {
		icons: {
			'tool-screenshot': '/tool-screenshot.svg',
		},
	}

	// [4]
	const customComponents: TLComponents = {
		InFrontOfTheCanvas: ScreenshotBox,
		Toolbar: ScreenshotToolbar,
	}
</script>

<!-- [5] -->
<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="svelteDraw_screenshot_example"
		tools={customTools}
		overrides={customUiOverrides}
		assetUrls={customAssetUrls}
		components={customComponents}
	/>
</div>

<!--
/*
Introduction:

This example shows how to create a custom tool. In svelte-draw, tools are parts of the
svelte-draw state chart. While the most common use for tools is creating shapes, you can
use tools to create other types of interactions too! In this example, we create a
"screenshot tool" that lets the user draw a box on the canvas. When the user finishes
drawing their box, we'll export (or copy) a screenshot of that area.

[1]
Our custom tool is a class that extends `StateNode`. See the ScreenshotTool folder for the
tool itself. The array is defined outside of any component markup and passed to the SvelteDraw
component's `tools` prop.

[2]
Register the tool with the UI by adding it to the `tools` object in a `TLUiOverrides`. This
gives the toolbar (and keyboard shortcuts) the tool's label, icon, shortcut, and what to do
when it's selected. The custom toolbar (ScreenshotToolbar.svelte) then places the item in front of the default content.

[3]
The toolbar item uses a custom icon, so we map its icon id to a url via `assetUrls.icons`.

[4]
(ScreenshotBox.svelte) While the tool's dragging state is active we draw the screenshot box in the
`InFrontOfTheCanvas` slot, which renders over the canvas but under menus and the toolbar. The
box lives in an atom on the dragging state node, so reading it inside `fromComputed` updates
this component as the user drags. `editor.getStateDescendant` finds that node by path.

[5]
All of the customizations are defined once in the script so they keep the same
identity; new objects on every update would make SvelteDraw re-register them.
*/
-->
