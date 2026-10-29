import type { TLComponents, TLUiOverrides } from 'svelte-draw'
import { playingCardIcon } from './PlayingCardIcon.svelte'
import PlayingCardShortcuts from './PlayingCardShortcuts.svelte'
import PlayingCardToolbar from './PlayingCardToolbar.svelte'

export const uiOverrides: TLUiOverrides = {
	tools(editor, tools) {
		// Create a tool item in the ui's context.
		tools.PlayingCard = {
			id: 'PlayingCard',
			icon: playingCardIcon,
			label: 'Playing card',
			kbd: 'c',
			onSelect: () => {
				editor.setCurrentTool('PlayingCard')
			},
		}
		return tools
	},
}

export const components: TLComponents = {
	Toolbar: PlayingCardToolbar,
	KeyboardShortcutsDialog: PlayingCardShortcuts,
}

// Same pattern as the custom-config example's ui-overrides.ts; see the guide there.
