import { getOwnerWindow, type Editor } from '@svelte-draw/editor'
import { throttle } from '@svelte-draw/utils'
import type { Attachment } from 'svelte/attachments'

/**
 * Keeps the editor's viewport screen bounds in sync with the element it is attached to
 * (`{@attach screenBounds(editor)}`). Replaces `useScreenBounds`.
 */
export function screenBounds(editor: Editor): Attachment<HTMLElement> {
	return (container) => {
		// Everything else uses a debounced update...
		const updateBounds = throttle(
			() => {
				// If the container's document has been torn down (e.g. an iframe
				// being removed), there's nothing to measure — bail.
				if (!container.ownerDocument.body) return
				editor.updateViewportScreenBounds(container)
			},
			200,
			{
				trailing: true,
			}
		)

		// Rather than running getClientRects on every frame, we'll
		// run it once a second or when the window resizes.
		const interval = editor.timers.setInterval(updateBounds, 1000)
		const win = editor.getContainerWindow()
		win.addEventListener('resize', updateBounds)

		const resizeObserver = new ResizeObserver((entries) => {
			if (!entries[0].contentRect) return
			updateBounds()
		})

		// When the container's size changes, update the bounds
		resizeObserver.observe(container)

		// When the container's nearest scrollable parent scrolls, update the bounds
		const scrollingParent = getNearestScrollableContainer(container)
		scrollingParent.addEventListener('scroll', updateBounds)

		return () => {
			clearInterval(interval)
			win.removeEventListener('resize', updateBounds)
			resizeObserver.disconnect()
			scrollingParent.removeEventListener('scroll', updateBounds)
			updateBounds.cancel()
		}
	}
}

/*!
 * Author: excalidraw
 * MIT License: https://github.com/excalidraw/excalidraw/blob/master/LICENSE
 * https://github.com/excalidraw/excalidraw/blob/48c3465b19f10ec755b3eb84e21a01a468e96e43/packages/excalidraw/utils.ts#L600
 */
const getNearestScrollableContainer = (element: HTMLElement): HTMLElement | Document => {
	const doc = element.ownerDocument
	const win = getOwnerWindow(element)
	let parent = element.parentElement
	while (parent) {
		if (parent === doc.body) {
			return doc
		}
		const { overflowY } = win.getComputedStyle(parent)
		const hasScrollableContent = parent.scrollHeight > parent.clientHeight
		if (
			hasScrollableContent &&
			(overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay')
		) {
			return parent
		}
		parent = parent.parentElement
	}
	return doc
}
