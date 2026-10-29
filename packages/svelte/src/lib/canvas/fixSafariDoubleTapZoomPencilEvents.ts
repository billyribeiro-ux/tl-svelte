import { elementShouldCaptureKeys, preventDefault, type Editor } from '@svelte-draw/editor'
import type { Attachment } from 'svelte/attachments'

/**
 * When double tapping with the pencil in iOS, it enables a little zoom window in the UI. We don't
 * want this for drawing operations and can disable it by setting 'disableDoubleTapZoom' in the main
 * editor.
 *
 * Use as `{@attach fixSafariDoubleTapZoomPencilEvents(editor)}`. Replaces
 * `useFixSafariDoubleTapZoomPencilEvents`.
 */
export function fixSafariDoubleTapZoomPencilEvents(editor: Editor): Attachment<HTMLElement> {
	return (elm) => {
		const win = editor.getContainerWindow()
		const handleEvent = (e: PointerEvent | TouchEvent) => {
			if (e instanceof win.PointerEvent && e.pointerType === 'pen') {
				editor.markEventAsHandled(e)
				const { target } = e

				if (
					elementShouldCaptureKeys(target instanceof win.Element ? target : null, false) ||
					editor.isIn('select.editing_shape')
				) {
					return
				}

				preventDefault(e)
			}
		}

		elm.addEventListener('touchstart', handleEvent)
		elm.addEventListener('touchend', handleEvent)
		return () => {
			elm.removeEventListener('touchstart', handleEvent)
			elm.removeEventListener('touchend', handleEvent)
		}
	}
}
