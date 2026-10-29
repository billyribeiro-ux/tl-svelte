import { getGlobalDocument, type Editor } from '@svelte-draw/editor'

/**
 * True when the `svelteDraw_preserve_focus` search param is present: the editor then does not
 * auto-focus, and instead focuses on pointerdown inside and blurs on pointerdown outside.
 */
export function noAutoFocus() {
	return getGlobalDocument().location.search.includes('svelteDraw_preserve_focus')
}

/**
 * Focus-on-pointerdown behaviour for the `svelteDraw_preserve_focus` mode (the old
 * `handleFocusOnPointerDownForPreserveFocusMode` effect of `SvelteDrawEditor`). For our examples
 * site, we want autoFocus to be true on the examples site, but not when embedded in our docs site.
 * If present, the search param overrides the `autoFocus` prop and prevents the editor from
 * focusing immediately; here we also focus the editor when the user clicks on it and unfocus it
 * when the user clicks away from it.
 *
 * Returns a teardown, or undefined when the mode is not active. Call it from an `$effect` and
 * return the result.
 */
export function preserveFocusOnPointerDown(
	editor: Editor,
	autoFocus?: boolean
): (() => void) | void {
	const container = editor.getContainer()

	function handleFocusOnPointerDown() {
		editor.focus()
	}

	function handleBlurOnPointerDown(e: PointerEvent) {
		// The same pointerdown bubbles from the container to the body; blurring here would
		// cancel the interaction the container listener just focused for. Check the composed
		// path rather than `e.target`: when the editor lives in an open shadow root the target
		// is retargeted to the shadow host by the time the event reaches the body. (A closed
		// shadow root truncates the path at the host, so those still blur.)
		if (e.composedPath().includes(container)) return
		editor.blur()
	}

	if (autoFocus && noAutoFocus()) {
		container.addEventListener('pointerdown', handleFocusOnPointerDown)
		container.ownerDocument.body.addEventListener('pointerdown', handleBlurOnPointerDown)

		return () => {
			container.removeEventListener('pointerdown', handleFocusOnPointerDown)
			container.ownerDocument.body.removeEventListener('pointerdown', handleBlurOnPointerDown)
		}
	}
}
