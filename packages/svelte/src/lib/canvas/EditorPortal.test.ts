import { mount, unmount } from 'svelte'
import { afterEach, describe, expect, it } from 'vitest'
import EditorHarness from './test/EditorHarness.svelte'
import { flush } from './test/helpers'
import PortaledSlot from './test/PortaledSlot.svelte'

describe('EditorPortal', () => {
	let app: ReturnType<typeof mount> | undefined

	afterEach(() => {
		if (app) unmount(app)
		app = undefined
		document.body.innerHTML = ''
	})

	async function renderEditor() {
		app = mount(EditorHarness, {
			target: document.body,
			// Mounted in a canvas slot — the deep-in-the-tree case the portal exists for.
			props: { components: { InFrontOfTheCanvas: PortaledSlot } },
		})
		await flush()
		return document.querySelector('.tl-container')!
	}

	const portaled = () => document.querySelector('[data-testid="portaled"]')!

	it('renders its children into the editor container', async () => {
		const container = await renderEditor()
		expect(container.contains(portaled())).toBe(true)
	})

	it('renders into a host that comes after everything the editor renders', async () => {
		const container = await renderEditor()
		const host = container.querySelector('.tl-portal-host')!
		expect(host.contains(portaled())).toBe(true)
		// Last of the container's rendered children. Managers append their own nodes after this one
		// (the text measurement element, say) but those are `tabIndex = -1` and out of the tab order.
		const rendered = [...container.children].filter((el) => !el.matches('.tl-text-measure'))
		expect(rendered.at(-1)).toBe(host)
	})

	// The tab order guarantee: mounted in a canvas slot, the portaled content still lands after
	// everything the editor renders itself — including (in svelte-draw) the UI's skip link, which only
	// works while nothing precedes it. Portaling straight into the container lands it ahead of them.
	it('places its children after the rest of the editor in document order', async () => {
		await renderEditor()
		const canvas = document.querySelector('[data-testid="canvas"]')!
		expect(
			canvas.compareDocumentPosition(portaled()) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy()
	})

	it('removes its children from the host when it unmounts', async () => {
		await renderEditor()
		unmount(app!)
		app = undefined
		expect(document.querySelector('[data-testid="portaled"]')).toBeNull()
	})
})
