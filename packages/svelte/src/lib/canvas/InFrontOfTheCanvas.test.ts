import { StateNode, type Editor } from '@svelte-draw/editor'
import { mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import EditorHarness from './test/EditorHarness.svelte'
import { flush } from './test/helpers'
import TestInFrontOfTheCanvas from './test/TestInFrontOfTheCanvas.svelte'

// Tool that tracks events for testing
class TrackingTool extends StateNode {
	static override id = 'tracking'
	static override isLockable = false

	events: Array<{ type: string; pointerId?: number }> = []

	override onPointerDown(info: any) {
		this.events.push({ type: 'pointerdown', pointerId: info.pointerId })
	}

	override onPointerUp(info: any) {
		this.events.push({ type: 'pointerup', pointerId: info.pointerId })
	}

	onPointerEnter(info: any) {
		this.events.push({ type: 'pointerenter', pointerId: info.pointerId })
	}

	onPointerLeave(info: any) {
		this.events.push({ type: 'pointerleave', pointerId: info.pointerId })
	}

	clearEvents() {
		this.events = []
	}
}

function pointer(type: string, pointerId: number) {
	return new PointerEvent(type, { pointerId, bubbles: true, cancelable: true })
}

describe('InFrontOfTheCanvas event handling', () => {
	let editor: Editor
	let app: ReturnType<typeof mount>

	beforeEach(async () => {
		app = mount(EditorHarness, {
			target: document.body,
			props: {
				tools: [TrackingTool],
				initialState: 'tracking',
				components: { InFrontOfTheCanvas: TestInFrontOfTheCanvas },
				onMount: (e: Editor) => {
					editor = e
				},
			},
		})
		await flush()
	})

	afterEach(() => {
		unmount(app)
		document.body.innerHTML = ''
	})

	function getTrackingTool() {
		return editor.getStateDescendant('tracking') as TrackingTool
	}

	const byTestId = (id: string) => document.querySelector(`[data-testid="${id}"]`)!

	it('should prevent canvas events when interacting with InFrontOfTheCanvas elements', async () => {
		const frontButton = byTestId('front-button')
		getTrackingTool().clearEvents()

		// Click on the front button - this should NOT trigger canvas events
		frontButton.dispatchEvent(pointer('pointerdown', 1))
		frontButton.dispatchEvent(pointer('pointerup', 1))
		frontButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		await flush()

		expect(getTrackingTool().events).toEqual([])
	})

	it('marks the pointer events of the in-front layer as handled', () => {
		const down = pointer('pointerdown', 1)
		const up = pointer('pointerup', 1)
		byTestId('front-button').dispatchEvent(down)
		byTestId('front-button').dispatchEvent(up)
		expect(editor.wasEventAlreadyHandled(down)).toBe(true)
		expect(editor.wasEventAlreadyHandled(up)).toBe(true)
	})

	it('should allow canvas events when interacting directly with canvas', async () => {
		const canvas = byTestId('canvas')
		getTrackingTool().clearEvents()

		// Click directly on canvas - this SHOULD trigger canvas events
		canvas.dispatchEvent(pointer('pointerdown', 1))
		canvas.dispatchEvent(pointer('pointerup', 1))
		await flush()

		expect(getTrackingTool().events.map((e) => e.type)).toEqual(['pointerdown', 'pointerup'])
	})

	it('should handle touch events correctly for InFrontOfTheCanvas', async () => {
		const frontDiv = byTestId('front-div')
		getTrackingTool().clearEvents()

		// Touch events on front element should not reach canvas, and are flagged as handled
		const touchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
			const event = new Event(type, { bubbles: true, cancelable: true })
			Object.defineProperty(event, 'touches', { value: touches })
			return event
		}
		const start = touchEvent('touchstart', [{ clientX: 50, clientY: 50 }])
		const end = touchEvent('touchend', [])
		frontDiv.dispatchEvent(start)
		frontDiv.dispatchEvent(end)
		await flush()

		expect(getTrackingTool().events).toEqual([])
		expect(editor.wasEventAlreadyHandled(start)).toBe(true)
		expect(editor.wasEventAlreadyHandled(end)).toBe(true)
	})

	it('should allow pointer events to continue working on canvas after InFrontOfTheCanvas interaction', async () => {
		const frontButton = byTestId('front-button')
		const canvas = byTestId('canvas')
		getTrackingTool().clearEvents()

		// First, interact with front element
		frontButton.dispatchEvent(pointer('pointerdown', 1))
		frontButton.dispatchEvent(pointer('pointerup', 1))
		await flush()

		// No events yet - the key thing is that front element events are blocked
		expect(getTrackingTool().events).toEqual([])

		// Then interact with canvas - the editor is still responsive
		canvas.dispatchEvent(pointer('pointerdown', 2))
		canvas.dispatchEvent(pointer('pointerup', 2))
		await flush()

		expect(getTrackingTool().events.map((e) => e.type)).toEqual(['pointerdown', 'pointerup'])
	})
})
