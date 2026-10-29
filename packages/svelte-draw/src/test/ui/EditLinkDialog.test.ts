import { createShapeId, Editor } from '@svelte-draw/editor'
import { afterEach, expect, it } from 'vitest'
import type { TLComponents } from '../../lib/SvelteDraw.svelte'
import OpenEditLinkDialogButton from '../svelte/fixtures/OpenEditLinkDialogButton.svelte'
import {
	act,
	fireEvent,
	renderSvelteDraw,
	screen,
	waitFor,
	type RenderedSvelteDraw,
} from '../svelte/renderSvelteDraw'

const components: TLComponents = {
	SharePanel: OpenEditLinkDialogButton as any,
}

const shapeId = createShapeId('box')

let rendered: RenderedSvelteDraw | undefined

async function renderWithOpenDialog() {
	rendered = await renderSvelteDraw({ components }, { waitForPatterns: false })
	const { editor } = rendered

	act(() => {
		editor.createShape({ id: shapeId, type: 'geo', props: { url: 'https://svelte-draw.invalid' } })
		editor.select(shapeId)
	})

	fireEvent.click(await screen.findByTestId('open-edit-link'))
	await waitFor(() => expect(getDialogFrame()).not.toBeNull())

	return editor
}

// The dialog frame that wraps whatever the dialog component renders. The bug left this
// frame mounted and empty, so checking only for the dialog's own content would not catch it.
function getDialogFrame() {
	return document.querySelector('.tlui-dialog__content')
}

async function expectDialogClosed() {
	await act(async () => {})
	await waitFor(() => expect(getDialogFrame()).toBeNull())
}

let editor: Editor

afterEach(() => {
	rendered?.unmount()
	editor?.dispose()
})

it('closes itself when the shape is deleted while the dialog is open', async () => {
	editor = await renderWithOpenDialog()
	expect(getDialogFrame()).not.toBeNull()

	act(() => {
		editor.deleteShape(shapeId)
	})

	await expectDialogClosed()
})

it('closes itself when the shape is deselected while the dialog is open', async () => {
	editor = await renderWithOpenDialog()
	expect(getDialogFrame()).not.toBeNull()

	act(() => {
		editor.selectNone()
	})

	await expectDialogClosed()
})
