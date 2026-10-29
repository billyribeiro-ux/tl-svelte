import { mount, unmount } from 'svelte'
import { afterEach, describe, expect, it } from 'vitest'
import EditorHarness from './test/EditorHarness.svelte'
import { flush } from './test/helpers'
import NestedPassThrough from './test/NestedPassThrough.svelte'
import PassThroughCulled from './test/PassThroughCulled.svelte'
import { passThroughState } from './test/passThroughState.svelte'

describe('usePassThroughWheelEvents', () => {
	let app: ReturnType<typeof mount> | undefined

	afterEach(() => {
		if (app) unmount(app)
		app = undefined
		passThroughState.visible = true
		passThroughState.tick = 0
		document.body.innerHTML = ''
	})

	async function renderEditor(InFrontOfTheCanvas: any = PassThroughCulled) {
		app = mount(EditorHarness, {
			target: document.body,
			props: { components: { InFrontOfTheCanvas } },
		})
		await flush()
		return document.querySelector('.tl-container')!
	}

	function wheelOverMarker(container: Element) {
		const canvas = container.querySelector('.tl-canvas')!
		const received: Event[] = []
		canvas.addEventListener('wheel', (e) => received.push(e))
		const marker = container.querySelector('[data-testid="marker"]')!
		marker.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 10 }))
		return received
	}

	// The editor only passes wheel events through while focused.
	async function focus(container: Element) {
		const editorEl = container as HTMLElement
		editorEl.dispatchEvent(new FocusEvent('focus'))
	}

	it('redispatches wheel events over the element to the canvas', async () => {
		const container = await renderEditor()
		await focus(container)
		expect(wheelOverMarker(container)).toHaveLength(1)
	})

	// The regression: the owner stays mounted across the cull, so an effect keyed on its deps never
	// re-runs and the listener is left on the discarded element.
	it('still redispatches after the element unmounts and remounts', async () => {
		const container = await renderEditor()
		passThroughState.visible = false
		await flush()
		passThroughState.visible = true
		await flush()
		expect(wheelOverMarker(container)).toHaveLength(1)
	})

	// An attachment is bound to its element, so re-renders that leave the element in place must not
	// stack another listener (one wheel would redispatch many).
	it('does not stack listeners across renders that leave the element in place', async () => {
		const container = await renderEditor()
		for (let i = 0; i < 3; i++) {
			passThroughState.tick++
			await flush()
		}
		expect(wheelOverMarker(container)).toHaveLength(1)
	})

	// Issue #10441: the original event keeps bubbling after the inner root redispatches it, so
	// without a flag on it the outer root would redispatch it again.
	it('redispatches once when the element is inside another pass-through element', async () => {
		const container = await renderEditor(NestedPassThrough)
		expect(wheelOverMarker(container)).toHaveLength(1)
	})

	it('stops redispatching once the owner unmounts', async () => {
		const container = await renderEditor()
		const marker = container.querySelector('[data-testid="marker"]')!
		const canvas = container.querySelector('.tl-canvas')!
		const received: Event[] = []
		canvas.addEventListener('wheel', (e) => received.push(e))
		unmount(app!)
		app = undefined
		marker.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 10 }))
		expect(received).toHaveLength(0)
	})
})
