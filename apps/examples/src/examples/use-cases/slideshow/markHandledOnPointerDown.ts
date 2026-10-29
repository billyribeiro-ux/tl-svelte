import type { Editor } from 'svelte-draw'
import type { Attachment } from 'svelte/attachments'
import { on } from 'svelte/events'

/**
 * Marks `pointerdown` as handled so the canvas doesn't treat the press as the start of a drag.
 * Svelte delegates `onpointerdown` to the app root, which runs after the editor container's own
 * native listener, so this has to be a native listener on the element itself.
 */
export function markHandledOnPointerDown(editor: Editor): Attachment<HTMLElement> {
	return (element) => on(element, 'pointerdown', (e) => editor.markEventAsHandled(e))
}
