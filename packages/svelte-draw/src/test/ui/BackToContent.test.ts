import { Box, Editor, Vec } from '@svelte-draw/editor'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	BACK_TO_CONTENT_APPEAR_DELAY_MS,
	suppressBackToContent,
} from '../../lib/ui/components/HelperButtons/BackToContent.svelte'
import {
	act,
	renderSvelteDraw,
	screen,
	waitFor,
	type RenderedSvelteDraw,
} from '../svelte/renderSvelteDraw'

let editor: Editor
let rendered: RenderedSvelteDraw

beforeEach(async () => {
	rendered = await renderSvelteDraw({}, { waitForPatterns: false })
	editor = rendered.editor

	// Set up a proper viewport so shapes can be on/off screen
	act(() => {
		editor.updateViewportScreenBounds(new Box(0, 0, 1000, 800))
	})
})

afterEach(() => {
	vi.useRealTimers()
	rendered.unmount()
})

function createShapeInViewport() {
	act(() => {
		editor.createShape({
			type: 'geo',
			x: 100,
			y: 100,
			props: { w: 100, h: 100 },
		})
	})
}

function panAllShapesOffScreen() {
	// Move camera so all shapes are off-screen
	act(() => {
		const camera = editor.getCamera()
		editor.setCamera(new Vec(camera.x - 2000, camera.y - 2000, camera.z), { immediate: true })
	})
}

// Bring content back into view by adding a shape inside the current viewport, so not all shapes
// are off-screen anymore. (Panning the camera back is unreliable in jsdom.)
function bringContentBackIntoView() {
	act(() => {
		const center = editor.getViewportPageBounds().center
		editor.createShape({
			type: 'geo',
			x: center.x - 50,
			y: center.y - 50,
			props: { w: 100, h: 100 },
		})
	})
}

const button = () => screen.queryByTestId('helper-buttons.back-to-content')

describe('BackToContent button', () => {
	it('shows when all shapes are off-screen, only after the appearance delay', async () => {
		vi.useFakeTimers()
		createShapeInViewport()

		// Initially, button should not be visible (shapes are on screen)
		expect(button()).toBeNull()

		panAllShapesOffScreen()

		// The button should not appear immediately, nor just before the delay elapses.
		expect(button()).toBeNull()
		act(() => {
			vi.advanceTimersByTime(BACK_TO_CONTENT_APPEAR_DELAY_MS - 1)
		})
		expect(button()).toBeNull()

		// Once the delay elapses, the button appears.
		act(() => {
			vi.advanceTimersByTime(2)
		})
		expect(button()).not.toBeNull()
	})

	it('shows when selected shapes are off-screen', async () => {
		vi.useFakeTimers()
		createShapeInViewport()

		const shapeId = editor.getCurrentPageShapeIds().values().next().value!

		// Select the shape
		act(() => {
			editor.select(shapeId)
		})

		expect(button()).toBeNull()

		panAllShapesOffScreen()

		// Button should still appear (after the delay) even though selected shapes aren't culled
		act(() => {
			vi.advanceTimersByTime(BACK_TO_CONTENT_APPEAR_DELAY_MS + 1)
		})
		expect(button()).not.toBeNull()
	})

	it('does not show when some shapes are still on-screen', async () => {
		// Create two shapes
		act(() => {
			editor.createShape({
				type: 'geo',
				x: 100,
				y: 100,
				props: { w: 100, h: 100 },
			})
			editor.createShape({
				type: 'geo',
				x: 500,
				y: 500,
				props: { w: 100, h: 100 },
			})
		})

		// Pan so only the first shape is off-screen
		act(() => {
			const camera = editor.getCamera()
			editor.setCamera(new Vec(camera.x - 300, camera.y - 300, camera.z), { immediate: true })
		})

		// Button should not appear since one shape is still visible
		await waitFor(() => {
			expect(button()).toBeNull()
		})
	})

	it('does not appear if content returns before the delay elapses', async () => {
		vi.useFakeTimers()
		createShapeInViewport()
		panAllShapesOffScreen()

		// Part-way through the delay, bring content back into view.
		act(() => {
			vi.advanceTimersByTime(BACK_TO_CONTENT_APPEAR_DELAY_MS - 1)
		})
		expect(button()).toBeNull()
		bringContentBackIntoView()

		// Past the original delay, the button should still never have appeared.
		act(() => {
			vi.advanceTimersByTime(BACK_TO_CONTENT_APPEAR_DELAY_MS + 1)
		})
		expect(button()).toBeNull()
	})

	it('hides immediately when content returns after the button is shown', async () => {
		vi.useFakeTimers()
		createShapeInViewport()
		panAllShapesOffScreen()

		act(() => {
			vi.advanceTimersByTime(BACK_TO_CONTENT_APPEAR_DELAY_MS + 1)
		})
		expect(button()).not.toBeNull()

		// Hiding is immediate, with no delay.
		bringContentBackIntoView()
		expect(button()).toBeNull()
	})

	it('cancels a pending appearance when back-to-content is suppressed', async () => {
		vi.useFakeTimers()
		createShapeInViewport()
		panAllShapesOffScreen()

		// While the appearance timer is pending, suppress the button (as happens when the user
		// navigates back to content).
		act(() => {
			suppressBackToContent(editor, BACK_TO_CONTENT_APPEAR_DELAY_MS * 4)
		})

		// The button should not appear once the delay elapses.
		act(() => {
			vi.advanceTimersByTime(BACK_TO_CONTENT_APPEAR_DELAY_MS + 1)
		})
		expect(button()).toBeNull()
	})
})
