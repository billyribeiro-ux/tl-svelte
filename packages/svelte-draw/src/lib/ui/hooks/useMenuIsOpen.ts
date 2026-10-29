import { useGlobalMenuIsOpen, tryGetEditor } from '@svelte-draw/svelte'
import { getUiEvents, type TLUiEventMap } from '../context'

/**
 * Tracks whether the menu with `id` is open, scoped to the current editor. Call during component
 * initialisation. `id` may be a getter. Replaces `useMenuIsOpen`.
 *
 * @example
 * ```ts
 * const menu = createMenuIsOpen('my-menu')
 * // template: open={menu.isOpen} onOpenChange={menu.onOpenChange}
 * ```
 *
 * @public
 */
export function createMenuIsOpen(id: string | (() => string), cb?: (isOpen: boolean) => void) {
	const editor = tryGetEditor()
	const trackEvent = getUiEvents()
	const getId = typeof id === 'function' ? id : () => id

	const onChange = (isOpen: boolean) => {
		if (isOpen) {
			editor?.complete()
		}
		cb?.(isOpen)
	}

	const onEvent = (eventName: string) => {
		trackEvent(eventName as keyof TLUiEventMap, { source: 'unknown', id: getId() })
	}

	return useGlobalMenuIsOpen(
		() => (editor ? `${getId()}-${editor.contextId}` : getId()),
		onChange,
		onEvent
	)
}
