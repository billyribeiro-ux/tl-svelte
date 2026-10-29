import type { Editor } from '@svelte-draw/editor'
import type { Attachment } from 'svelte/attachments'

/**
 * Marks pointerdown / pointerup / touchstart / touchend on an element as handled by the editor, so
 * the rest of svelte-draw ignores them (`editor.markEventAsHandled`). Used by the
 * `InFrontOfTheCanvas` wrapper. Native listeners on the element run before any ancestor's, which is
 * the ordering the React `onPointerDown={editor.markEventAsHandled}` props were meant to give.
 */
export function markPointerEventsAsHandled(editor: Editor): Attachment<HTMLElement> {
	return (element) => {
		const names = ['pointerdown', 'pointerup', 'touchstart', 'touchend'] as const
		const handler = (e: Event) => editor.markEventAsHandled(e)
		for (const name of names) element.addEventListener(name, handler)
		return () => {
			for (const name of names) element.removeEventListener(name, handler)
		}
	}
}
