<script lang="ts">
	import {
		SvelteDraw,
		type TLComponents,
		type TLUiAssetUrlOverrides,
		type TLUiOverrides,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import StickerKeyboardShortcutsDialog from './StickerKeyboardShortcutsDialog.svelte'
	import StickerToolbar from './StickerToolbar.svelte'
	import { StickerTool } from './sticker-tool-util'

	// There's a guide at the bottom of this file!

	// [1]
	const uiOverrides: TLUiOverrides = {
		tools(editor, tools) {
			tools.sticker = {
				id: 'sticker',
				icon: 'heart-icon',
				label: 'Sticker',
				kbd: 's',
				onSelect: () => {
					editor.setCurrentTool('sticker')
				},
			}
			return tools
		},
	}

	// [2]
	const components: TLComponents = {
		Toolbar: StickerToolbar,
		// [3]
		KeyboardShortcutsDialog: StickerKeyboardShortcutsDialog,
	}

	// [4]
	const customAssetUrls: TLUiAssetUrlOverrides = {
		icons: {
			'heart-icon': '/heart-icon.svg',
		},
	}

	// [5]
	const customTools = [StickerTool]
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		tools={customTools}
		initialState="sticker"
		overrides={uiOverrides}
		{components}
		assetUrls={customAssetUrls}
	/>
</div>

<!--
Introduction:
You can make an icon for your custom tool appear on svelte-draw's toolbar. To do this
you need to add the tool to the UI's tools context, override the toolbar
component, optionally add the tool to the keyboard shortcuts dialog, and pass in
an asset URL for its icon. For more information on how to implement custom
tools, check out the custom tool example.

[1]
The `tools` override adds a tool item to the UI's tools context. The item
describes how the tool appears in menus (icon, label, keyboard shortcut) and
what happens when it's selected. This is separate from the `StateNode` class
that implements the tool's behavior; the UI needs both.

[2]
Override the `Toolbar` component (StickerToolbar.svelte) so we can place our tool in it.
`DefaultToolbar` provides the toolbar chrome and `DefaultToolbarContent` renders the built-in
tools, so we render our own `SvelteDrawUiMenuItem` before it. `createIsToolSelected`
lets the button show as active when the sticker tool is the current tool.

[3]
The keyboard shortcuts dialog doesn't know about custom tools, so we override
it (StickerKeyboardShortcutsDialog.svelte) and append our tool after
`DefaultKeyboardShortcutsDialogContent`. This makes the tool's shortcut show up in the dialog.

[4]
The tool item references an icon named `heart-icon`, so we tell the UI where to
find that icon via the `assetUrls` prop. Any icon name that isn't a built-in
svelte-draw icon needs an entry here.

[5]
Define the tools array outside of any reactive code so it's a stable reference. We
pass the tools, overrides, components, and asset URLs to the `SvelteDraw` component,
and set `initialState="sticker"` so the tool is selected on load.
-->
