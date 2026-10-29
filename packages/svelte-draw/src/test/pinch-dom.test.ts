import { Box, Editor, createShapeId } from '@svelte-draw/editor'
import {
	act,
	renderSvelteDraw,
	type RenderedSvelteDraw,
} from './testutils/renderSvelteDrawComponent'

// These tests drive the real DOM event handlers (the canvas pointer
// events, the touch pinch gesture) rather than dispatching synthetic
// editor events, so they exercise the same path a touch device takes.

const ids = {
	a: createShapeId('a'),
	b: createShapeId('b'),
	c: createShapeId('c'),
}

function pointerDownEvent(clientX: number, clientY: number, pointerId = 1) {
	return new (globalThis as any).PointerEvent('pointerdown', {
		bubbles: true,
		cancelable: true,
		clientX,
		clientY,
		button: 0,
		pointerId,
		pointerType: 'touch',
		isPrimary: pointerId === 1,
	})
}

function touchEvent(type: string, points: Array<{ clientX: number; clientY: number }>) {
	const e = new Event(type, { bubbles: true, cancelable: true })
	const touches = points.map((p, i) => ({ clientX: p.clientX, clientY: p.clientY, identifier: i }))
	Object.defineProperties(e, {
		touches: { value: touches },
		targetTouches: { value: touches },
		changedTouches: { value: touches },
	})
	return e
}

const renders: RenderedSvelteDraw[] = []

afterEach(() => {
	for (const r of renders.splice(0)) {
		r.editor.dispose()
		r.unmount()
	}
})

async function setupScene() {
	const rendered = await renderSvelteDraw()
	renders.push(rendered)
	const { editor } = rendered
	const canvas = document.querySelector('[data-testid="canvas"]') as HTMLElement
	await act(async () => {
		editor.updateViewportScreenBounds(new Box(0, 0, 1000, 1000))
		editor.createShapes([
			// centers: a (50,50), b (250,50), c (450,50)
			{ id: ids.a, type: 'geo', x: 0, y: 0, props: { fill: 'solid', w: 100, h: 100 } },
			{ id: ids.b, type: 'geo', x: 200, y: 0, props: { fill: 'solid', w: 100, h: 100 } },
			{ id: ids.c, type: 'geo', x: 400, y: 0, props: { fill: 'solid', w: 100, h: 100 } },
		])
	})
	return { editor, canvas }
}

// Two-finger pinch-zoom. The gesture handler defers pinch_end to a rAF, so we
// wait for it to fire and then flush the editor's pending event queue.
async function pinchZoom(editor: Editor, canvas: HTMLElement) {
	await act(async () => {
		canvas.dispatchEvent(
			touchEvent('touchstart', [
				{ clientX: 250, clientY: 50 },
				{ clientX: 350, clientY: 50 },
			])
		)
		editor.emit('tick', 16)
	})
	await act(async () => {
		canvas.dispatchEvent(
			touchEvent('touchmove', [
				{ clientX: 220, clientY: 50 },
				{ clientX: 380, clientY: 50 },
			])
		)
		editor.emit('tick', 16)
	})
	await act(async () => {
		canvas.dispatchEvent(touchEvent('touchend', []))
	})
	await act(async () => {
		await new Promise((r) => setTimeout(r, 32)) // let the deferred rAF dispatch pinch_end
		editor.emit('tick', 16) // flush pinch_end (immediate restore)
		editor.emit('tick', 16) // run the deferred once('tick') re-restore
	})
}

describe('pinch selection via real DOM events', () => {
	it('rolls back an incidental first-finger selection on a touch pinch', async () => {
		const { editor, canvas } = await setupScene()

		await act(async () => {
			editor.select(ids.a)
		})

		// First finger lands on shape b — through the real pointer handler this
		// changes the selection before the pinch starts.
		await act(async () => {
			canvas.dispatchEvent(pointerDownEvent(250, 50))
			editor.emit('tick', 16)
		})
		expect(editor.getSelectedShapeIds()).toEqual([ids.b])

		await pinchZoom(editor, canvas)

		expect(editor.getZoomLevel()).toBeGreaterThan(1) // the pinch really zoomed
		expect(editor.getSelectedShapeIds()).toEqual([ids.a]) // incidental change rolled back
	})

	it('restores correctly when a second pointer_down arrives before pinch_start', async () => {
		// Models the touch ordering where both fingers' pointer_down events are
		// processed before touchstart fires pinch_start. The pre-gesture selection
		// must still win.
		const { editor, canvas } = await setupScene()

		await act(async () => {
			editor.select(ids.a)
		})

		await act(async () => {
			canvas.dispatchEvent(pointerDownEvent(250, 50, 1)) // finger 1 on b
			editor.emit('tick', 16)
			canvas.dispatchEvent(pointerDownEvent(450, 50, 2)) // finger 2 on c
			editor.emit('tick', 16)
		})

		await pinchZoom(editor, canvas)

		expect(editor.getSelectedShapeIds()).toEqual([ids.a])
	})

	it('keeps the live selection for a pinch with no preceding pointer_down', async () => {
		// Models the Safari-style path: a click changes the selection, then a pinch
		// arrives with no fresh pointer_down. The clicked shape must stay selected.
		const { editor, canvas } = await setupScene()

		await act(async () => {
			editor.select(ids.a, ids.b)
			editor.setSelectedShapes([ids.c]) // "click" outcome, no live pointer_down
		})

		await pinchZoom(editor, canvas)

		expect(editor.getSelectedShapeIds()).toEqual([ids.c])
	})
})
