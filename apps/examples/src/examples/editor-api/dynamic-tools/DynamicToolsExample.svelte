<script lang="ts">
	import {
		SvelteDraw,
		type TLComponents,
		type TLUiAssetUrlOverrides,
		type TLUiOverrides,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './dynamic-tools.css'
	import HeartToolbar from './HeartToolbar.svelte'
	import { isHeartToolEnabled$ } from './HeartTool'
	import ToggleHeartToolButton from './ToggleHeartToolButton.svelte'

	// There's a guide at the bottom of this file!

	// [3]
	const uiOverrides: TLUiOverrides = {
		tools(editor, tools) {
			tools.heart = {
				id: 'heart',
				icon: 'heart-icon',
				label: 'Heart',
				kbd: 'y',
				onSelect: () => {
					// [4]
					if (!isHeartToolEnabled$.get()) return
					editor.setCurrentTool('heart')
				},
			}
			return tools
		},
	}

	const customAssetUrls: TLUiAssetUrlOverrides = {
		icons: {
			'heart-icon': '/heart-icon.svg',
		},
	}

	// [5]
	const components: TLComponents = {
		Toolbar: HeartToolbar,
		InFrontOfTheCanvas: ToggleHeartToolButton,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		overrides={uiOverrides}
		{components}
		assetUrls={customAssetUrls}
		onMount={() => {
			// [8]
			isHeartToolEnabled$.set(false)
		}}
	/>
</div>

<!--
`editor.setTool` and `editor.removeTool` add and remove tools from the editor's state chart after
it has been created. Use them when a tool's availability depends on runtime conditions such as
permissions or feature flags.

[1]
HeartTool.ts is a minimal tool that stamps a heart at the pointer. It is deliberately not passed to
`<SvelteDraw>` via the `tools` prop; it is added later with `setTool`.

[2]
Whether the tool is currently installed lives in an atom in HeartTool.ts. Keeping this in an atom
lets the toolbar and the toggle button share it without lifting state into the example component,
which would force the `components` object to be recreated on every change.

[3]
Register the tool with the UI so the toolbar knows its label, icon, and shortcut. This entry can
exist even while the tool is absent from the state chart; the toolbar below decides whether to
show it. The shortcut is `y` because `r` already belongs to the rectangle tool.

[4]
Keyboard shortcuts are registered from the `tools` override whether or not the toolbar shows the
item, so pressing `y` while the tool is uninstalled would call `setCurrentTool` on a state that
doesn't exist and throw. Guard on the atom instead.

[5]
HeartToolbar.svelte reads the atom with `fromSignal` and only renders the heart item while the
tool exists. The toggle button (ToggleHeartToolButton.svelte) lives in `InFrontOfTheCanvas` and
gets the editor from `getEditor()`.

[6]
Removing a tool does not exit it if it's active, so switch to select first. `removeTool` is a
no-op if the tool isn't in the state chart.

[7]
`setTool` constructs the tool and attaches it to the root state. It throws if a tool with the
same id already exists, so don't call it twice without removing first.

[8]
A fresh editor starts without the tool, so reset the flag in case the example remounts.
-->
