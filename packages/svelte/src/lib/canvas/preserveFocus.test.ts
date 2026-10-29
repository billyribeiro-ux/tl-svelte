import { createTLStore, type Editor } from '@svelte-draw/editor'
import { mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flush } from './test/helpers'
import PreserveFocusHarness from './test/PreserveFocusHarness.svelte'

// The `svelteDraw_preserve_focus` search param switches the editor into preserve-focus mode, where
// a pointerdown inside the container focuses the editor and a pointerdown elsewhere blurs it.
describe('preserve-focus mode', () => {
	const mounted: Element[] = []
	const apps: Array<ReturnType<typeof mount>> = []

	beforeEach(() => {
		window.history.replaceState(null, '', '?svelteDraw_preserve_focus')
	})

	afterEach(() => {
		for (const app of apps.splice(0)) unmount(app)
		window.history.replaceState(null, '', '/')
		for (const el of mounted.splice(0)) el.remove()
	})

	function pointerDown(target: EventTarget) {
		target.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
	}

	async function mountEditor(root: Element | ShadowRoot) {
		const store = createTLStore({ shapeUtils: [], bindingUtils: [] })
		const container = document.createElement('div')
		root.appendChild(container)
		mounted.push(container)
		let editor: Editor | undefined
		const app = mount(PreserveFocusHarness, {
			target: container,
			props: {
				store,
				onMount: (e: Editor) => {
					editor = e
				},
			},
		})
		apps.push(app)
		await flush()
		return { editor: editor!, unmount: () => unmount(app) }
	}

	it('focuses on a canvas pointerdown and blurs on a pointerdown outside', async () => {
		const { editor } = await mountEditor(document.body)
		expect(editor.getIsFocused()).toBe(false)

		pointerDown(editor.getContainer().querySelector('.tl-canvas')!)
		expect(editor.getIsFocused()).toBe(true)

		pointerDown(document.body)
		expect(editor.getIsFocused()).toBe(false)
	})

	it('keeps focus when the editor is inside an open shadow root', async () => {
		// The body listener sees the event retargeted to the shadow host, so a check on
		// `e.target` alone would blur the editor right after the container focused it.
		const host = document.createElement('div')
		document.body.appendChild(host)
		mounted.push(host)
		const { editor } = await mountEditor(host.attachShadow({ mode: 'open' }))

		pointerDown(editor.getContainer().querySelector('.tl-canvas')!)
		expect(editor.getIsFocused()).toBe(true)

		pointerDown(document.body)
		expect(editor.getIsFocused()).toBe(false)
	})

	it('removes the body listener on unmount', async () => {
		const { editor, unmount } = await mountEditor(document.body)
		const blur = vi.spyOn(editor, 'blur')

		unmount()
		await flush()
		pointerDown(document.body)
		expect(blur).not.toHaveBeenCalled()
	})

	it('autofocuses as usual, and ignores outside pointerdowns, without the search param', async () => {
		window.history.replaceState(null, '', '/')
		const { editor } = await mountEditor(document.body)
		expect(editor.getIsFocused()).toBe(true)

		pointerDown(document.body)
		expect(editor.getIsFocused()).toBe(true)
	})
})
