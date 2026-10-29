import { afterEach, describe, expect, it } from 'vitest'
import PortaledButton from '../svelte/fixtures/PortaledButton.svelte'
import { renderSvelteDraw, type RenderedSvelteDraw } from '../svelte/renderSvelteDraw'

let rendered: RenderedSvelteDraw
afterEach(() => rendered?.unmount())

/**
 * The reason `EditorPortal` exists rather than appending to the container yourself: a portal
 * takes its DOM position from the commit that mounts it, so portaling into the container from a
 * canvas slot lands the node ahead of the UI — and ahead of the skip link, which is only a keyboard
 * route to the canvas while nothing precedes it.
 */
describe('EditorPortal in a full editor', () => {
	it('renders after the UI and its skip link', async () => {
		rendered = await renderSvelteDraw(
			{ components: { InFrontOfTheCanvas: PortaledButton as any } },
			{ waitForPatterns: false }
		)

		const portaled = await rendered.findByTestId('portaled-button')
		const skipLink = document.querySelector('.tl-skip-to-main-content')!
		const ui = document.querySelector('.tlui-layout')!

		expect(
			skipLink.compareDocumentPosition(portaled) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy()
		expect(ui.compareDocumentPosition(portaled) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
	})
})
