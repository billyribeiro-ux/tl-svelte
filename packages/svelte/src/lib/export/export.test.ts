import {
	Editor,
	Geometry2d,
	Rectangle2d,
	ShapeUtil,
	T,
	createShapeId,
	createTLStore,
	registerSvgExportRenderer,
	shapeView,
	type RecordProps,
	type TLShape,
} from '@svelte-draw/editor'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { svelteSvgExportRenderer } from './renderer'
import DelayedRect from './test/DelayedRect.svelte'
import HtmlBox from './test/HtmlBox.svelte'
import SvgRect from './test/SvgRect.svelte'
import Throws from './test/Throws.svelte'

declare module '@svelte-draw/tlschema' {
	export interface TLGlobalShapePropsMap {
		'svg-shape': { w: number; h: number }
		'html-shape': { w: number; h: number }
		'delayed-shape': { w: number; h: number }
		'throwing-shape': { w: number; h: number }
	}
}

abstract class BoxUtil<S extends TLShape> extends ShapeUtil<S> {
	static override props: RecordProps<any> = { w: T.number, h: T.number }
	getDefaultProps(): any {
		return { w: 100, h: 50 }
	}
	getGeometry(shape: S): Geometry2d {
		const { w, h } = shape.props as { w: number; h: number }
		return new Rectangle2d({ width: w, height: h, isFilled: true })
	}
	getIndicatorPath() {
		return undefined
	}
}

class SvgShape extends BoxUtil<TLShape<'svg-shape'>> {
	static override type = 'svg-shape' as const
	component() {
		return null
	}
	override toSvg(shape: TLShape<'svg-shape'>) {
		return shapeView(SvgRect, { w: shape.props.w, h: shape.props.h })
	}
}
class HtmlShape extends BoxUtil<TLShape<'html-shape'>> {
	static override type = 'html-shape' as const
	component() {
		return shapeView(HtmlBox, { label: 'hello' })
	}
}
class DelayedShape extends BoxUtil<TLShape<'delayed-shape'>> {
	static override type = 'delayed-shape' as const
	component() {
		return null
	}
	override toSvg(shape: TLShape<'delayed-shape'>) {
		return shapeView(DelayedRect, { w: shape.props.w, h: shape.props.h })
	}
}
class ThrowingShape extends BoxUtil<TLShape<'throwing-shape'>> {
	static override type = 'throwing-shape' as const
	component() {
		return shapeView(Throws, { label: 'x' })
	}
}

const utils = [SvgShape, HtmlShape, DelayedShape, ThrowingShape]
let editor: Editor

beforeEach(() => {
	registerSvgExportRenderer(svelteSvgExportRenderer)
	editor = new Editor({
		shapeUtils: utils,
		bindingUtils: [],
		tools: [],
		store: createTLStore({ shapeUtils: utils, bindingUtils: [] }),
		getContainer: () => document.body,
	})
})

afterEach(() => {
	registerSvgExportRenderer(null)
	editor.dispose()
})

describe('svelteSvgExportRenderer', () => {
	it('renders toSvg views, with transform and viewBox', async () => {
		const id = createShapeId('a')
		editor.createShape({ id, type: 'svg-shape', x: 10, y: 20, props: { w: 100, h: 50 } })
		const result = await editor.getSvgElement([id], { padding: 0 })
		expect(result).toBeDefined()
		const svg = result!.svg
		expect(svg.getAttribute('viewBox')).toBe('10 20 100 50')
		expect(svg.namespaceURI).toBe('http://www.w3.org/2000/svg')
		const rect = svg.querySelector('[data-testid="svg-rect"]')!
		expect(rect.namespaceURI).toBe('http://www.w3.org/2000/svg')
		expect(rect.parentElement!.tagName).toBe('g')
		expect(rect.parentElement!.getAttribute('transform')).toContain('matrix(1, 0, 0, 1, 10, 20)')
	})

	it('renders shapes without toSvg into a foreignObject', async () => {
		const id = createShapeId('b')
		editor.createShape({ id, type: 'html-shape', x: 0, y: 0, props: { w: 100, h: 50 } })
		const result = await editor.getSvgElement([id], { padding: 0 })
		const fo = result!.svg.querySelector('foreignObject.tl-export-embed-styles')!
		expect(fo).not.toBeNull()
		const wrapper = fo.firstElementChild as HTMLElement
		expect(wrapper.getAttribute('data-shape-type')).toBe('html-shape')
		expect(wrapper.className).toBe('tl-shape')
		expect(wrapper.style.width).toBe('100px')
		expect(wrapper.querySelector('.html-box')!.textContent).toBe('hello')
	})

	it('waits for delaySvgExport before serialising', async () => {
		const id = createShapeId('c')
		editor.createShape({ id, type: 'delayed-shape', x: 0, y: 0, props: { w: 10, h: 10 } })
		const result = await editor.getSvgElement([id], { padding: 0 })
		expect(result!.svg.querySelector('[data-testid="delayed-rect"]')!.getAttribute('fill')).toBe(
			'green'
		)
	})

	it('drops a foreignObject shape whose view throws instead of failing the export', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const ok = createShapeId('ok')
		const bad = createShapeId('bad')
		editor.createShapes([
			{ id: ok, type: 'svg-shape', x: 0, y: 0, props: { w: 10, h: 10 } },
			{ id: bad, type: 'throwing-shape', x: 0, y: 0, props: { w: 10, h: 10 } },
		])
		const result = await editor.getSvgElement([ok, bad], { padding: 0 })
		expect(result!.svg.querySelector('[data-testid="svg-rect"]')).not.toBeNull()
		expect(result!.svg.querySelector('[data-shape-type="throwing-shape"]')).toBeNull()
		warn.mockRestore()
	})

	it('unmounts the off-screen target after the export', async () => {
		vi.useFakeTimers()
		try {
			const id = createShapeId('d')
			editor.createShape({ id, type: 'svg-shape', x: 0, y: 0, props: { w: 10, h: 10 } })
			const promise = editor.getSvgElement([id])
			await vi.runAllTimersAsync()
			await promise
			await vi.runAllTimersAsync()
			expect(document.body.querySelector('.svelte-draw-svg-export')).toBeNull()
		} finally {
			vi.useRealTimers()
		}
	})
})
