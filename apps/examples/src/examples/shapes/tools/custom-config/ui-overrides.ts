import type { TLComponents, TLUiOverrides } from 'svelte-draw'
import CardShortcuts from './CardShortcuts.svelte'
import CardToolbar from './CardToolbar.svelte'

export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		// Create a tool item in the ui's context.
		tools.card = {
			id: 'card',
			icon: 'color',
			label: 'Card',
			kbd: 'c',
			onSelect: () => {
				editor.setCurrentTool('card')
			},
		}
		return tools
	},
}

export const components: TLComponents = {
	Toolbar: CardToolbar,
	KeyboardShortcutsDialog: CardShortcuts,
}

/*
This file contains overrides for the SvelteDraw UI. These overrides are used to add your custom tools to
the toolbar and the keyboard shortcuts menu.

First we have to add our new tool to the tools object in the tools override. This is where we define
all the basic information about our new tool - its icon, label, keyboard shortcut, what happens when
we select it, etc.

Then, we replace the UI components for the toolbar and keyboard shortcut dialog (CardToolbar.svelte and CardShortcuts.svelte) with our own, which
add our new tool in front of the existing default content.
*/
