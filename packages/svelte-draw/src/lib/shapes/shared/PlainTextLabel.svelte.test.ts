import {
	Geometry2d,
	Rectangle2d,
	ShapeUtil,
	T,
	createShapeId,
	type RecordProps,
	type TLBaseShape,
} from '@svelte-draw/editor'
import { flushSync } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestEditor, flush, mountInEditor } from '../../../test/svelte/helpers'
import PlainTextLabel from './PlainTextLabel.svelte'

// Not registered in TLGlobalShapePropsMap on purpose: a `declare module` here would leak into the
// shape types of every other file in the package.
type PlainLabelShape = TLBaseShape<'plain-label-shape', { w: number; h: number; text: string }>

class PlainLabelShapeUtil extends ShapeUtil<any> {
	static override type = 'plain-label-shape' as const
	static override props: RecordProps<any> = { w: T.number, h: T.number, text: T.string }
	getDefaultProps(): any {
		return { w: 100, h: 50, text: '' }
	}
	getGeometry(shape: PlainLabelShape): Geometry2d {
		return new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true })
	}
	getIndicatorPath() {
		return undefined
	}
	override canEdit() {
		return true
	}
	component() {
		return null
	}
}

const id = createShapeId('label')

let test: ReturnType<typeof createTestEditor>
let mounted: ReturnType<typeof mountInEditor> | undefined

beforeEach(() => {
	test = createTestEditor({ shapeUtils: [PlainLabelShapeUtil] })
	test.editor.createShape({ id, type: 'plain-label-shape', props: { text: 'hello' } } as any)
})

afterEach(() => {
	mounted?.unmount()
	mounted = undefined
	test.dispose()
	vi.restoreAllMocks()
})

const baseProps = {
	shapeId: id,
	type: 'plain-label-shape',
	fontFamily: 'sans-serif',
	fontSize: 20,
	lineHeight: 1.5,
	textAlign: 'start' as const,
	verticalAlign: 'middle' as const,
	labelColor: 'red',
	isSelected: false,
}

function mountLabel(props: Record<string, unknown> = {}) {
	mounted = mountInEditor(test, PlainTextLabel, { ...baseProps, text: 'hello', ...props })
	return mounted.target
}

describe('PlainTextLabel', () => {
	it('marks an empty label as having no text', () => {
		// Like the React original, an empty string still normalizes to one (blank) line for the DOM,
		// so the wrapper renders; the shape util is what skips labels without text.
		const target = mountLabel({ text: '' })
		const wrapper = target.querySelector<HTMLElement>('.tl-text-wrapper')!
		expect(wrapper.dataset.hastext).toBe('false')
		expect(wrapper.querySelector('.tl-text-content')!.textContent!.trim()).toBe('')
	})

	it('renders the wrapper, data attributes, styles and one div per line', () => {
		const target = mountLabel({ text: 'one\ntwo\n\nfour', wrap: true, padding: 4, textWidth: 40.2 })
		const wrapper = target.querySelector<HTMLElement>('.tl-text-wrapper')!
		expect(wrapper.className).toBe('tl-text-label tl-text-wrapper tl-plain-text-wrapper')
		expect(wrapper.getAttribute('aria-hidden')).toBe('true')
		expect(wrapper.dataset.hastext).toBe('true')
		expect(wrapper.dataset.isediting).toBe('false')
		expect(wrapper.dataset.isReadyForEditing).toBe('false')
		expect(wrapper.dataset.textwrap).toBe('true')
		expect(wrapper.dataset.isselected).toBe('false')
		expect(wrapper.style.fontFamily).toBe('sans-serif')
		expect(wrapper.style.textAlign).toBe('start')
		expect(wrapper.style.justifyContent).toBe('flex-start')
		expect(wrapper.style.alignItems).toBe('center')
		expect(wrapper.style.padding).toBe('4px')

		const inner = wrapper.querySelector<HTMLElement>('.tl-text-label__inner')!
		expect(inner.className).toBe('tl-text-label__inner tl-text-content__wrapper')
		expect(inner.style.fontSize).toBe('20px')
		expect(inner.style.lineHeight).toBe('30px')
		expect(inner.style.minHeight).toBe('30px')
		expect(inner.style.minWidth).toBe('41px')
		expect(inner.style.width).toBe('41px')
		expect(inner.style.color).toBe('red')

		const content = inner.querySelector('.tl-text-content')!
		expect(content.className).toBe('tl-text tl-text tl-text-content tl-text__outline')
		expect(content.getAttribute('dir')).toBe('auto')
		// an empty line renders as a single space so that it keeps its height
		expect([...content.children].map((c) => c.textContent)).toEqual(['one', 'two', ' ', 'four'])
		// not selected and not being edited: no textarea
		expect(inner.querySelector('textarea')).toBeNull()
	})

	it('uses the class name prefix, centres legacy alignments and applies overriding styles', () => {
		const target = mountLabel({
			classNamePrefix: 'tl-arrow',
			textAlign: 'middle-legacy',
			verticalAlign: 'end',
			showTextOutline: false,
			style: { padding: 9, transformOrigin: 'top left' },
		})
		const wrapper = target.querySelector<HTMLElement>('.tl-text-wrapper')!
		expect(wrapper.className).toBe('tl-arrow-label tl-text-wrapper tl-plain-text-wrapper')
		expect(wrapper.style.justifyContent).toBe('center')
		expect(wrapper.style.alignItems).toBe('flex-end')
		// `style` comes after the label's own styles
		expect(wrapper.style.padding).toBe('9px')
		expect(wrapper.style.transformOrigin).toBe('top left')
		expect(wrapper.querySelector('.tl-arrow.tl-text-content')!.className).toContain(
			'tl-text__no-outline'
		)
	})

	it('renders a textarea with the initial text while the shape is selected', () => {
		const target = mountLabel({ isSelected: true })
		const textarea = target.querySelector('textarea')!
		expect(textarea.className).toBe('tl-text tl-text-input')
		expect(textarea.value).toBe('hello')
		// not editing: the textarea is inert
		expect(textarea.disabled).toBe(true)
		expect(textarea.readOnly).toBe(true)
		expect(textarea.getAttribute('tabindex')).toBe('-1')
		expect(textarea.getAttribute('wrap')).toBe('off')
		expect(textarea.getAttribute('spellcheck')).toBe('true')
		expect(textarea.getAttribute('dir')).toBe('auto')
		expect(textarea.getAttribute('name')).toBe('text')
	})

	describe('while the shape is being edited', () => {
		beforeEach(() => {
			test.editor.setEditingShape(id)
		})

		it('marks the label as editing, focuses the textarea and keeps the label visible', async () => {
			const target = mountLabel({ text: '' })
			await flush()
			const wrapper = target.querySelector<HTMLElement>('.tl-text-wrapper')!
			expect(wrapper).not.toBeNull()
			expect(wrapper.getAttribute('aria-hidden')).toBe('false')
			expect(wrapper.dataset.isediting).toBe('true')
			expect(wrapper.dataset.isReadyForEditing).toBe('true')
			expect(wrapper.dataset.hastext).toBe('false')
			const textarea = target.querySelector('textarea')!
			expect(textarea.disabled).toBe(false)
			expect(test.editor.getContainerDocument().activeElement).toBe(textarea)
		})

		it('writes typed text to the shape, normalizing new lines', async () => {
			const target = mountLabel()
			await flush()
			const textarea = target.querySelector('textarea')!
			textarea.value = 'a\r\nb'
			textarea.dispatchEvent(new Event('input', { bubbles: true }))
			expect((test.editor.getShape(id) as any).props.text).toBe('a\nb')
		})

		it('completes editing on ctrl/meta + enter only', async () => {
			const complete = vi.spyOn(test.editor, 'complete')
			const target = mountLabel()
			await flush()
			const textarea = target.querySelector('textarea')!
			textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
			expect(complete).not.toHaveBeenCalled()
			textarea.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true })
			)
			expect(complete).toHaveBeenCalledTimes(1)
			textarea.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Enter', metaKey: true, bubbles: true })
			)
			expect(complete).toHaveBeenCalledTimes(2)
		})

		it('calls a custom onKeyDown instead of the default handler', async () => {
			const complete = vi.spyOn(test.editor, 'complete')
			const onKeyDown = vi.fn()
			const target = mountLabel({ onKeyDown })
			await flush()
			const textarea = target.querySelector('textarea')!
			textarea.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true, bubbles: true })
			)
			expect(onKeyDown).toHaveBeenCalledTimes(1)
			expect(complete).not.toHaveBeenCalled()
		})

		it('selects the text on the select-all-text event for this shape', async () => {
			const target = mountLabel()
			await flush()
			const textarea = target.querySelector('textarea')!
			const select = vi.spyOn(textarea, 'select')
			test.editor.emit('select-all-text', { shapeId: createShapeId('other') })
			expect(select).not.toHaveBeenCalled()
			test.editor.emit('select-all-text', { shapeId: id })
			expect(select).toHaveBeenCalledTimes(1)
		})

		it('keeps the label rendered when editing stops', async () => {
			const target = mountLabel()
			await flush()
			test.editor.setEditingShape(null)
			flushSync()
			const wrapper = target.querySelector<HTMLElement>('.tl-text-wrapper')!
			expect(wrapper.dataset.isediting).toBe('false')
		})
	})
})
