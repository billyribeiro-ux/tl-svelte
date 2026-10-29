import type { TLUiOverrides } from 'svelte-draw'

export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		tools.counter = {
			id: 'counter',
			icon: 'color',
			label: 'Counter',
			kbd: 'c',
			onSelect: () => {
				editor.setCurrentTool('counter')
			},
		}
		return tools
	},
}
