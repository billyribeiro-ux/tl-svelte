import { getUiEvents, useGlobalMenuIsOpen, type TLUiEventMap } from 'svelte-draw'
import { globalEditor } from '../../../../utils/globalEditor'

/**
 * `createMenuIsOpen` (the SDK's `useMenuIsOpen`) scopes the menu id to the editor from Svelte
 * context. The sidebar sits outside the editor's tree, so there is none; the React sidebar got its
 * editor through `globalEditor`, and the sidebar's overlay click clears menus by that editor's
 * `contextId`. This scopes the id the same way. Call during component initialisation.
 */
export function createGlobalEditorMenuIsOpen(
	id: string | (() => string),
	cb?: (isOpen: boolean) => void
) {
	const trackEvent = getUiEvents()
	const getId = typeof id === 'function' ? id : () => id

	return useGlobalMenuIsOpen(
		() => {
			const editor = globalEditor.get()
			return editor ? `${getId()}-${editor.contextId}` : getId()
		},
		(isOpen) => {
			if (isOpen) {
				globalEditor.get()?.complete()
			}
			cb?.(isOpen)
		},
		(eventName) => {
			trackEvent(eventName as keyof TLUiEventMap, { source: 'unknown', id: getId() })
		}
	)
}
