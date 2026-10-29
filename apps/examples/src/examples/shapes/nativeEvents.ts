import type { Attachment } from 'svelte/attachments'
import { on } from 'svelte/events'

type NativeHandlers<E extends Element> = {
	[K in keyof HTMLElementEventMap]?: (this: E, event: HTMLElementEventMap[K]) => void
}

/**
 * Same behaviour as `packages/svelte-draw/src/lib/shapes/shared/nativeEvents.ts` (not part of the
 * public `svelte-draw` entry point, so the examples carry this copy): adds native, non-delegated
 * listeners so a handler can `stopPropagation()` / `editor.markEventAsHandled()` before the editor
 * container's own listeners run. Svelte delegates `pointerdown`, `click`, ... to the app root, which
 * is too late for that.
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
