import { createRawSnippet } from 'svelte'
import type { TLComponents, TLUiOverrides } from 'svelte-draw'
import MarkKeyboardShortcutsDialog from './MarkKeyboardShortcutsDialog.svelte'
import MarkToolbar from './MarkToolbar.svelte'

// [1]
export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		tools.mark = {
			id: 'mark',
			// The icon is a snippet rather than JSX
			icon: createRawSnippet(() => ({
				render: () => '<span style="font-size: 2em">📝</span>',
			})),
			label: 'Mark exam',
			kbd: 'm',
			onSelect: () => {
				editor.setCurrentTool('mark')
			},
		}
		return tools
	},
}

// [2]
export const components: TLComponents = {
	Toolbar: MarkToolbar,
	KeyboardShortcutsDialog: MarkKeyboardShortcutsDialog,
}

/*
[1]
The `tools` override registers the tool item in the UI: its icon, label, keyboard shortcut,
and what selecting it does. Registering it here is what makes `getTools()` return it below.

[2]
The toolbar and keyboard shortcuts dialog don't pick up new tools automatically, so we
replace both with versions that render our item ahead of the default content.
*/
