import type { Editor } from '@svelte-draw/editor'
import type { Attachment } from 'svelte/attachments'

/**
 * An attachment that keeps a cursor chat bubble under the pointer: it jumps to the current screen
 * point when attached, then follows `pointermove` on the container's window. Replaces
 * `usePositionBubble`.
 *
 * @internal
 */
export function positionCursorChatBubble(editor: Editor): Attachment<HTMLElement> {
	return (elm) => {
		const { x, y } = editor.inputs.getCurrentScreenPoint()
		elm.style.setProperty('transform', `translate(${x}px, ${y}px)`)

		// Positioning the chat bubble
		function positionChatBubble(e: PointerEvent) {
			const { minX, minY } = editor.getViewportScreenBounds()
			elm.style.setProperty('transform', `translate(${e.clientX - minX}px, ${e.clientY - minY}px)`)
		}

		const win = editor.getContainerWindow()
		win.addEventListener('pointermove', positionChatBubble)

		return () => {
			win.removeEventListener('pointermove', positionChatBubble)
		}
	}
}
