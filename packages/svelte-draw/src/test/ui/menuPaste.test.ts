import { expect, it } from 'vitest'
import { act, fireEvent, renderSvelteDraw, screen } from '../svelte/renderSvelteDraw'

// Kept apart from menuGating.test.ts, which stubs the clipboard API before the menu modules load.
it('hides Paste in the main menu when the browser cannot read the clipboard', async () => {
	expect(navigator.clipboard?.read).toBeUndefined()
	const rendered = await renderSvelteDraw({}, { waitForPatterns: false })
	const { editor } = rendered
	act(() => editor.menus.addOpenMenu('main menu'))
	const trigger = await screen.findByTestId('main-menu-sub.edit-button')
	act(() => trigger.focus())
	fireEvent.keyDown(trigger, { key: 'ArrowRight' })
	await screen.findByTestId('main-menu.copy')
	expect(screen.queryByTestId('main-menu.paste')).toBeNull()
	rendered.unmount()
})
