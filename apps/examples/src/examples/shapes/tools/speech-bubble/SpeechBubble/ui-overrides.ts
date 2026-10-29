import type { TLComponents, TLUiAssetUrlOverrides, TLUiOverrides } from 'svelte-draw'
import SpeechBubbleShortcuts from './SpeechBubbleShortcuts.svelte'
import SpeechBubbleToolbar from './SpeechBubbleToolbar.svelte'

// There's a guide at the bottom of this file!

// [1]
export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		tools.speech = {
			id: 'speech-bubble',
			icon: 'speech-bubble',
			label: 'Speech bubble',
			kbd: 's',
			onSelect: () => {
				editor.setCurrentTool('speech-bubble')
			},
		}
		return tools
	},
}

// [2]
export const customAssetUrls: TLUiAssetUrlOverrides = {
	icons: {
		'speech-bubble': '/speech-bubble.svg',
	},
}

// [3]
export const components: TLComponents = {
	Toolbar: SpeechBubbleToolbar,
	KeyboardShortcutsDialog: SpeechBubbleShortcuts,
}

/*
This file adds the speech bubble tool to the toolbar and the keyboard shortcuts dialog.

[1]
The `tools` override registers the tool item with the UI: its icon, label, keyboard shortcut,
and what happens when it's selected.

[2]
The tool item uses a custom icon, so we provide its url through the SvelteDraw component's
`assetUrls` prop. The key must match the `icon` on the tool item.

[3]
We replace the toolbar and keyboard shortcuts dialog (SpeechBubbleToolbar.svelte and
SpeechBubbleShortcuts.svelte) with versions that render our tool item
alongside the default content. Here it's added at the start; you can place it anywhere among
the default items instead.
*/
