import { defineMessages, fromComputed } from 'svelte-draw'
import { globalEditor } from '../../../../utils/globalEditor'

export interface RecentFile {
	fileId: string
	date: number
	isPinned: boolean
}

export const messages = defineMessages({
	create: { defaultMessage: 'Create file' },
	toggleSidebar: { defaultMessage: 'Toggle sidebar' },
	accountMenu: { defaultMessage: 'Account menu' },
	fileMenu: { defaultMessage: 'File menu' },
})

/**
 * The sidebar toggles hide until an editor exists, and while it is in focus mode. Was
 * `useHideSidebarToggle()`. Reads the `globalEditor` atom itself (not `getGlobalEditor()`) so the
 * computed captures it as a dependency.
 */
export function getHideSidebarToggle(): { readonly current: boolean } {
	return fromComputed('hideSidebarToggle', () => {
		const editor = globalEditor.get()
		return !editor || editor.getInstanceState().isFocusMode
	})
}
