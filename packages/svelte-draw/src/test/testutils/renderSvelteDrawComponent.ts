import { Box, type Editor } from '@svelte-draw/editor'
import { flush } from '../svelte/helpers'

// jsdom has no CSS.escape, which the shared render helper uses to look up test ids.
globalThis.CSS ??= {} as typeof CSS
CSS.escape ??= (value: string) => String(value).replace(/["\\]/g, '\\$&')

export { byTestId, renderSvelteDraw, type RenderedSvelteDraw } from '../svelte/renderSvelteDraw'

/**
 * Runs `fn`, then lets Svelte effects and pending microtasks settle: the equivalent of React
 * Testing Library's `act`.
 */
export async function act(fn: () => unknown | Promise<unknown>) {
	await fn()
	await flush()
}

/**
 * jsdom has no layout, so the editor's viewport is 1x1 and the UI picks the smallest breakpoint.
 * The React suite pinned `useBreakpoint` to desktop in setupVitest.js; this is the equivalent for
 * Svelte, where the breakpoint derives from the viewport width.
 */
export async function useDesktopViewport(editor: Editor) {
	editor.updateViewportScreenBounds(new Box(0, 0, 1920, 1080))
	await flush()
}
