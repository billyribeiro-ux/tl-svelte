import { afterEach, expect, it } from 'vitest'
import type { TLComponents } from '../../lib/SvelteDraw.svelte'
import OpenDialogButton from '../svelte/fixtures/OpenDialogButton.svelte'
import OpenDialogButtonPreventClose from '../svelte/fixtures/OpenDialogButtonPreventClose.svelte'
import OpenParentDialogButton from '../svelte/fixtures/OpenParentDialogButton.svelte'
import { flush } from '../svelte/helpers'
import {
	fireEvent,
	renderSvelteDraw,
	screen,
	type RenderedSvelteDraw,
} from '../svelte/renderSvelteDraw'

// jsdom doesn't implement scrollIntoView, which the select calls when it opens.
Element.prototype.scrollIntoView ??= () => {}

// bits-ui dismisses layers asynchronously (Radix did so synchronously inside act()), so every
// assertion that follows a dismissing event waits for the layer stack to settle first.
const settle = () => flush(50)

let rendered: RenderedSvelteDraw | undefined
afterEach(() => rendered?.unmount())

async function renderWithParentDialog() {
	const components: TLComponents = {
		SharePanel: OpenParentDialogButton as any,
	}
	rendered = await renderSvelteDraw({ components }, { waitForPatterns: false })
}

async function renderWithDialog(opts: { preventBackgroundClose?: boolean } = {}) {
	const components: TLComponents = {
		SharePanel: (opts.preventBackgroundClose
			? OpenDialogButtonPreventClose
			: OpenDialogButton) as any,
	}
	rendered = await renderSvelteDraw({ components }, { waitForPatterns: false })
}

// jsdom has no layout, so every element's rect is 0x0 at the origin. bits-ui only treats a press as
// outside a layer when its coordinates fall outside that layer's rect (Radix did not look at them),
// so a backdrop press carries a coordinate no zero-sized rect contains.
const OUTSIDE_THE_DIALOG = { clientX: -1, clientY: -1 }

// A full press on the dialog backdrop. Radix dismisses on pointer-down, but we fire the
// whole sequence so a layer-blind click handler (the bug this guards against) would be caught.
function pressBackdrop() {
	const el = document.querySelector('.tlui-dialog__positioner')
	if (!el) throw new Error('dialog positioner (backdrop) not found')
	fireEvent.pointerDown(el, { pointerType: 'mouse', ...OUTSIDE_THE_DIALOG })
	fireEvent.pointerUp(el, { pointerType: 'mouse' })
	fireEvent.click(el)
}

// Press the backdrop of the topmost dialog (the last positioner in the DOM) — used when
// dialogs are stacked, so the press lands on the layer that should dismiss first.
function pressTopBackdrop() {
	const positioners = document.querySelectorAll('.tlui-dialog__positioner')
	const el = positioners[positioners.length - 1]
	if (!el) throw new Error('dialog positioner (backdrop) not found')
	fireEvent.pointerDown(el, { pointerType: 'mouse', ...OUTSIDE_THE_DIALOG })
	fireEvent.pointerUp(el, { pointerType: 'mouse' })
	fireEvent.click(el)
}

it('dismisses a select opened inside a modal before the modal itself', async () => {
	await renderWithDialog()

	fireEvent.click(screen.getByTestId('open-dialog'))
	await screen.findByTestId('dialog-inner')

	// Open the select.
	fireEvent.pointerDown(screen.getByTestId('select-trigger'), { button: 0, pointerType: 'mouse' })
	await screen.findByTestId('select-content')

	// A press on the dialog backdrop closes only the select; the dialog stays open.
	pressBackdrop()

	await settle()
	expect(screen.queryByTestId('select-content')).toBeNull()
	expect(screen.queryByTestId('dialog-inner')).not.toBeNull()

	// A second press on the backdrop then closes the dialog.
	pressBackdrop()

	await settle()
	expect(screen.queryByTestId('dialog-inner')).toBeNull()
})

it('dismisses a normal dialog on a backdrop press', async () => {
	await renderWithDialog()

	fireEvent.click(screen.getByTestId('open-dialog'))
	await screen.findByTestId('dialog-inner')

	pressBackdrop()

	await settle()
	expect(screen.queryByTestId('dialog-inner')).toBeNull()
})

it('does not dismiss when a press starts inside the content and ends on the backdrop', async () => {
	await renderWithDialog()

	fireEvent.click(screen.getByTestId('open-dialog'))
	await screen.findByTestId('dialog-inner')

	// A press that starts inside the content (e.g. selecting text)...
	fireEvent.pointerDown(screen.getByTestId('dialog-inner'), { pointerType: 'mouse' })
	// ...and is released on the backdrop should not dismiss the dialog, since Radix
	// dismisses on pointer-down and the press began inside the content.
	const el = document.querySelector('.tlui-dialog__positioner')!
	fireEvent.pointerUp(el, { pointerType: 'mouse' })
	fireEvent.click(el)
	await settle()

	expect(screen.queryByTestId('dialog-inner')).not.toBeNull()
})

it('dismisses a dialog on escape', async () => {
	await renderWithDialog()

	fireEvent.click(screen.getByTestId('open-dialog'))
	await screen.findByTestId('dialog-inner')

	fireEvent.keyDown(document.body, { key: 'Escape' })

	await settle()
	expect(screen.queryByTestId('dialog-inner')).toBeNull()
})

it('escape dismisses one stacked layer at a time: the select first, then the dialog', async () => {
	await renderWithDialog()

	fireEvent.click(screen.getByTestId('open-dialog'))
	await screen.findByTestId('dialog-inner')

	fireEvent.pointerDown(screen.getByTestId('select-trigger'), { button: 0, pointerType: 'mouse' })
	await screen.findByTestId('select-content')

	// The first escape closes only the select (the topmost layer); the dialog stays.
	fireEvent.keyDown(document.body, { key: 'Escape' })

	await settle()
	expect(screen.queryByTestId('select-content')).toBeNull()
	expect(screen.queryByTestId('dialog-inner')).not.toBeNull()

	// The second escape then closes the dialog.
	fireEvent.keyDown(document.body, { key: 'Escape' })

	await settle()
	expect(screen.queryByTestId('dialog-inner')).toBeNull()
})

it('keeps a preventBackgroundClose dialog open on a backdrop press but still closes on escape', async () => {
	await renderWithDialog({ preventBackgroundClose: true })

	fireEvent.click(screen.getByTestId('open-dialog'))
	await screen.findByTestId('dialog-inner')

	// A backdrop press is ignored...
	pressBackdrop()

	await settle()
	expect(screen.queryByTestId('dialog-inner')).not.toBeNull()

	// ...but escape still dismisses the dialog.
	fireEvent.keyDown(document.body, { key: 'Escape' })

	await settle()
	expect(screen.queryByTestId('dialog-inner')).toBeNull()
})

it('backdrop presses dismiss stacked dialogs one layer at a time', async () => {
	await renderWithParentDialog()

	fireEvent.click(screen.getByTestId('open-parent'))
	await screen.findByTestId('parent-dialog')

	fireEvent.click(screen.getByTestId('open-nested'))
	await screen.findByTestId('nested-dialog')

	// Opening the nested dialog (which stacks on top and grabs focus) must not dismiss
	// the parent — the dialogs stack rather than collapsing together.
	expect(screen.queryByTestId('parent-dialog')).not.toBeNull()

	// A backdrop press closes only the topmost (nested) dialog; the parent stays open.
	pressTopBackdrop()

	await settle()
	expect(screen.queryByTestId('nested-dialog')).toBeNull()
	expect(screen.queryByTestId('parent-dialog')).not.toBeNull()

	// A second backdrop press then closes the parent.
	pressTopBackdrop()

	await settle()
	expect(screen.queryByTestId('parent-dialog')).toBeNull()
})

it('escape dismisses a nested dialog before its parent', async () => {
	await renderWithParentDialog()

	fireEvent.click(screen.getByTestId('open-parent'))
	await screen.findByTestId('parent-dialog')

	fireEvent.click(screen.getByTestId('open-nested'))
	await screen.findByTestId('nested-dialog')

	// The first escape closes only the nested dialog; the parent stays.
	fireEvent.keyDown(document.body, { key: 'Escape' })

	await settle()
	expect(screen.queryByTestId('nested-dialog')).toBeNull()
	expect(screen.queryByTestId('parent-dialog')).not.toBeNull()

	// The second escape then closes the parent.
	fireEvent.keyDown(document.body, { key: 'Escape' })

	await settle()
	expect(screen.queryByTestId('parent-dialog')).toBeNull()
})
