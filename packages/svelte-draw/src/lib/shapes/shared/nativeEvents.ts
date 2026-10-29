import type { Attachment } from 'svelte/attachments'
import { on } from 'svelte/events'

type NativeHandlers<E extends Element> = {
	[K in keyof HTMLElementEventMap]?: (this: E, event: HTMLElementEventMap[K]) => void
}

/**
 * An attachment that adds native (non-delegated) event listeners to an element:
 * `<div {@attach nativeEvents({ pointerdown: handler })}>`.
 *
 * Svelte delegates events such as `pointerdown` and `click` to the app root, so an `onpointerdown`
 * attribute runs AFTER the editor container's own native listeners and cannot stop them with
 * `stopPropagation()` or beat them to `editor.markEventAsHandled()`. React's synthetic events had
 * the opposite ordering for the label/button handlers ported from React, so those use this instead.
 */
export function nativeEvents<E extends Element = HTMLElement>(
	handlers: NativeHandlers<E>,
	options?: AddEventListenerOptions
): Attachment<E> {
	return (element) => {
		const cleanups: (() => void)[] = []
		for (const [type, handler] of Object.entries(handlers)) {
			if (!handler) continue
			cleanups.push(on(element, type, handler as (event: Event) => void, options))
		}
		return () => {
			for (const cleanup of cleanups) cleanup()
		}
	}
}
