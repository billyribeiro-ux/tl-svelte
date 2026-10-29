import {
	BaseBoxShapeUtil,
	createShapeId,
	shapeView,
	T,
	type Editor,
	type RecordProps,
	type TLShape,
} from '@svelte-draw/editor'
import { mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ShapeCulling } from './shapeCulling'
import EditorHarness from './test/EditorHarness.svelte'
import { flush } from './test/helpers'
import TestShapeBackground from './test/TestShapeBackground.svelte'
import TestShapeBody from './test/TestShapeBody.svelte'

const TYPE = 'test-view-box'

declare module '@svelte-draw/tlschema' {
	export interface TLGlobalShapePropsMap {
		[TYPE]: { w: number; h: number; label: string }
	}
}

type IViewShape = TLShape<typeof TYPE>

const calls = { component: 0 }

class ViewShapeUtil extends BaseBoxShapeUtil<IViewShape> {
	static override type = TYPE
	static override props: RecordProps<IViewShape> = {
		w: T.number,
		h: T.number,
		label: T.string,
	}
	getDefaultProps(): IViewShape['props'] {
		return { w: 100, h: 50, label: 'hello' }
	}
	getIndicatorPath() {
		return undefined
	}
	component(shape: IViewShape) {
		calls.component++
		// Reads a signal: the view must be recomputed when the zoom changes.
		const zoom = this.editor.getZoomLevel()
		return shapeView(TestShapeBody, {
			label: shape.props.label,
			zoom,
			boom: shape.props.label === 'boom',
		})
	}
	override backgroundComponent(shape: IViewShape) {
		return shapeView(TestShapeBackground, { label: shape.props.label })
	}
}

describe('Shape', () => {
	let editor: Editor
	let app: ReturnType<typeof mount>

	beforeEach(async () => {
		calls.component = 0
		app = mount(EditorHarness, {
			target: document.body,
			props: {
				shapeUtils: [ViewShapeUtil],
				onMount: (e: Editor) => {
					editor = e
				},
			},
		})
		await flush()
		// jsdom measures every element as 0x0, which would cull every shape
		editor.updateInstanceState({ screenBounds: { x: 0, y: 0, w: 1000, h: 800 } })
		await flush()
	})

	afterEach(() => {
		unmount(app)
		document.body.innerHTML = ''
	})

	const wrapper = (id: string, background = false) =>
		document.querySelector<HTMLElement>(
			`[data-shape-id="${id}"]${background ? '.tl-shape-background' : ':not(.tl-shape-background)'}`
		)!

	it('renders the ShapeView of the util inside a positioned wrapper', async () => {
		const id = createShapeId()
		editor.createShape<IViewShape>({ id, type: TYPE, x: 10, y: 20 })
		await flush()

		const el = wrapper(id)
		expect(el.classList.contains('tl-shape')).toBe(true)
		expect(el.getAttribute('data-shape-type')).toBe(TYPE)
		expect(el.getAttribute('draggable')).toBe('false')
		expect(el.getAttribute('data-shape-is-filled')).toBe('false')
		expect(el.querySelector('[data-testid="shape-body"]')?.textContent).toBe('hello')
		// positioned by the quick reactor
		expect(el.style.transform).toBe('matrix(1, 0, 0, 1, 10, 20)')
		expect(el.style.width).toBe('100px')
		expect(el.style.height).toBe('50px')
		expect(el.style.opacity).toBe('1')
		expect(el.style.zIndex).not.toBe('')
		expect(el.style.display).toBe('block')

		// the background gets its own wrapper
		const bg = wrapper(id, true)
		expect(bg.querySelector('[data-testid="shape-background"]')?.textContent).toBe('hello')
		expect(bg.hasAttribute('data-shape-is-filled')).toBe(false)
	})

	it('re-renders the inside when the shape props change, but not when only its position does', async () => {
		const id = createShapeId()
		editor.createShape<IViewShape>({ id, type: TYPE, x: 0, y: 0 })
		await flush()
		const renders = calls.component

		editor.updateShape<IViewShape>({ id, type: TYPE, x: 40, y: 40 })
		await flush()
		expect(calls.component).toBe(renders)
		expect(wrapper(id).style.transform).toBe('matrix(1, 0, 0, 1, 40, 40)')

		editor.updateShape<IViewShape>({ id, type: TYPE, props: { label: 'changed' } })
		await flush()
		expect(calls.component).toBeGreaterThan(renders)
		expect(wrapper(id).querySelector('[data-testid="shape-body"]')?.textContent).toBe('changed')
		expect(wrapper(id, true).querySelector('[data-testid="shape-background"]')?.textContent).toBe(
			'changed'
		)
	})

	it('re-renders the inside when a signal read by util.component() changes', async () => {
		const id = createShapeId()
		editor.createShape<IViewShape>({ id, type: TYPE, x: 0, y: 0 })
		await flush()
		const body = () => wrapper(id).querySelector('[data-testid="shape-body"]')!
		const before = body().getAttribute('data-zoom')

		editor.setCamera({ x: 0, y: 0, z: 2 })
		await flush()

		expect(before).toBe('1')
		expect(body().getAttribute('data-zoom')).toBe('2')
	})

	it('shows the shape error fallback and annotates the error when the inside throws', async () => {
		const annotate = vi.spyOn(editor, 'annotateError')
		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		const id = createShapeId()
		editor.createShape<IViewShape>({ id, type: TYPE, x: 0, y: 0, props: { label: 'boom' } })
		await flush()

		const el = wrapper(id)
		expect(el.querySelector('.tl-shape-error-boundary')).not.toBeNull()
		expect(el.querySelector('[data-testid="shape-body"]')).toBeNull()
		expect(annotate).toHaveBeenCalledTimes(1)
		expect(annotate.mock.calls[0][0]).toMatchObject({ message: 'boom from TestShapeBody' })
		expect(annotate.mock.calls[0][1]).toEqual({ origin: 'shape', willCrashApp: false })
		errorSpy.mockRestore()
	})

	it('removes the wrapper when the shape is deleted', async () => {
		const id = createShapeId()
		editor.createShape<IViewShape>({ id, type: TYPE, x: 0, y: 0 })
		await flush()
		expect(wrapper(id)).not.toBeNull()

		editor.deleteShape(id)
		await flush()
		expect(wrapper(id)).toBeNull()
	})

	it('mirrors editing/selecting state onto the canvas as data attributes', async () => {
		const id = createShapeId()
		editor.createShape<IViewShape>({ id, type: TYPE, x: 0, y: 0 })
		await flush()
		const canvas = document.querySelector('[data-testid="canvas"]')!
		expect(canvas.getAttribute('data-isselectinganything')).toBe('false')
		expect(canvas.getAttribute('data-iseditinganything')).toBe('false')

		editor.select(id)
		await flush()
		expect(canvas.getAttribute('data-isselectinganything')).toBe('true')
	})

	it('hides the moving-camera hit test blocker while the camera is idle', async () => {
		const blocker = document.querySelector('.tl-hit-test-blocker')!
		expect(blocker.classList.contains('tl-hit-test-blocker__hidden')).toBe(true)
	})
})

describe('ShapeCulling', () => {
	it('sets display on register and when the culled set changes', () => {
		const culling = new ShapeCulling()
		const id = createShapeId('a')
		const container = document.createElement('div')
		const bg = document.createElement('div')
		culling.register(id, container, bg, true)
		expect(container.style.display).toBe('none')
		expect(bg.style.display).toBe('none')

		culling.updateCulling(new Set())
		expect(container.style.display).toBe('block')
		expect(bg.style.display).toBe('block')

		culling.updateCulling(new Set([id]))
		expect(container.style.display).toBe('none')

		culling.unregister(id)
		culling.updateCulling(new Set())
		expect(container.style.display).toBe('none')
	})
})
