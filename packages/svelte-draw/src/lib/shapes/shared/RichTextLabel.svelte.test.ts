import {
	Geometry2d,
	Rectangle2d,
	ShapeUtil,
	StateNode,
	T,
	createShapeId,
	runtime,
	type RecordProps,
	type TLRichText,
	type TLBaseShape,
} from '@svelte-draw/editor'
import { flushSync } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestEditor, flush, mountInEditor } from '../../../test/svelte/helpers'
import { tipTapDefaultExtensions } from '../../utils/text/richText'
import RichTextLabel from './RichTextLabel.svelte'

// Not registered in TLGlobalShapePropsMap on purpose: a `declare module` here would leak into the
// shape types of every other file in the package.
type RichLabelShape = TLBaseShape<
	'rich-label-shape',
	{ w: number; h: number; richText: TLRichText }
>

const richText = (text: string): TLRichText => ({
	type: 'doc',
	content: [{ type: 'paragraph', content: text ? [{ type: 'text', text }] : [] }],
})

class RichLabelShapeUtil extends ShapeUtil<any> {
	static override type = 'rich-label-shape' as const
	static override props: RecordProps<any> = { w: T.number, h: T.number, richText: T.any }
	getDefaultProps(): any {
		return { w: 100, h: 50, richText: richText('') }
	}
	getGeometry(shape: RichLabelShape): Geometry2d {
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

class SelectTool extends StateNode {
	static override id = 'select'
}

const id = createShapeId('label')

let test: ReturnType<typeof createTestEditor>
let mounted: ReturnType<typeof mountInEditor> | undefined

beforeEach(() => {
	test = createTestEditor({
		shapeUtils: [RichLabelShapeUtil],
		tools: [SelectTool],
		initialState: 'select',
		textOptions: { tipTapConfig: { extensions: tipTapDefaultExtensions } },
	})
	test.editor.createShape({
		id,
		type: 'rich-label-shape',
		props: { richText: richText('hello') },
	} as any)
})

afterEach(() => {
	mounted?.unmount()
	mounted = undefined
	test.dispose()
	vi.restoreAllMocks()
})

const baseProps = {
	shapeId: id,
	type: 'rich-label-shape',
	fontFamily: 'sans-serif',
	fontSize: 20,
	lineHeight: 1.5,
	textAlign: 'end' as const,
	verticalAlign: 'start' as const,
	labelColor: 'red',
	isSelected: false,
}

function mountLabel(props: Record<string, unknown> = {}) {
	mounted = mountInEditor(test, RichTextLabel, {
		...baseProps,
		richText: richText('hello'),
		...props,
	})
	return mounted.target
}

describe('RichTextLabel', () => {
	it('renders nothing when the rich text is empty and the shape is not being edited', () => {
		const target = mountLabel({ richText: richText('') })
		expect(target.querySelector('.tl-text-wrapper')).toBeNull()
	})

	it('renders the rich text html with the wrapper classes, data attributes and styles', () => {
		const target = mountLabel({ wrap: true, padding: 3, textHeight: 20.5 })
		const wrapper = target.querySelector<HTMLElement>('.tl-text-wrapper')!
		expect(wrapper.className).toBe(
			'tl-text-label tl-text-wrapper tl-rich-text-wrapper tl-text__outline'
		)
		expect(wrapper.getAttribute('aria-hidden')).toBe('true')
		expect(wrapper.dataset.hastext).toBe('true')
		expect(wrapper.dataset.isediting).toBe('false')
		expect(wrapper.dataset.textwrap).toBe('true')
		expect(wrapper.dataset.isselected).toBe('false')
		expect(wrapper.style.justifyContent).toBe('flex-end')
		expect(wrapper.style.alignItems).toBe('flex-start')
		expect(wrapper.style.padding).toBe('3px')

		const inner = wrapper.querySelector<HTMLElement>('.tl-text-label__inner')!
		expect(inner.className).toBe('tl-text-label__inner tl-text-content__wrapper')
		expect(inner.style.lineHeight).toBe('30px')
		expect(inner.style.getPropertyValue('--tl-rich-text-heading-line-height')).toBe('1.5')
		expect(inner.style.height).toBe('21px')

		const rich = inner.querySelector<HTMLElement>('.tl-text-content > .tl-rich-text')!
		expect(rich.dataset.isSelectToolActive).toBe('true')
		expect(rich.dataset.isReadyForEditing).toBe('false')
		expect(rich.innerHTML).toContain('<p')
		expect(rich.textContent).toBe('hello')
		// not selected and not being edited: no editor area
		expect(inner.querySelector('[data-testid="rich-text-area"]')).toBeNull()
	})

	it('follows the select tool state', () => {
		const target = mountLabel()
		const rich = target.querySelector<HTMLElement>('.tl-text-content > .tl-rich-text')!
		expect(rich.dataset.isSelectToolActive).toBe('true')
	})

	it('omits the outline class when showTextOutline is false and uses the class prefix', () => {
		const target = mountLabel({ showTextOutline: false, classNamePrefix: 'tl-geo' })
		const wrapper = target.querySelector<HTMLElement>('.tl-text-wrapper')!
		expect(wrapper.className).toBe(
			'tl-geo-label tl-text-wrapper tl-rich-text-wrapper tl-text__no-outline'
		)
		expect(wrapper.querySelector('.tl-geo.tl-text-content')).not.toBeNull()
	})

	it('prevents the default of a pointerdown on a link and opens it on pointer up unless dragging', () => {
		const open = vi.spyOn(runtime, 'openWindow').mockImplementation(() => {})
		const target = mountLabel({
			richText: {
				type: 'doc',
				content: [
					{
						type: 'paragraph',
						content: [
							{
								type: 'text',
								text: 'link',
								marks: [{ type: 'link', attrs: { href: 'https://example.com/' } }],
							},
						],
					},
				],
			},
		})
		const anchor = target.querySelector('a')!
		const down = new Event('pointerdown', { bubbles: true, cancelable: true })
		anchor.dispatchEvent(down)
		expect(down.defaultPrevented).toBe(true)

		test.editor.emit('event', { name: 'pointer_up' } as any)
		expect(open).toHaveBeenCalledWith('https://example.com/', '_blank', false)

		// the pointer-up listener removes itself after firing
		open.mockClear()
		test.editor.emit('event', { name: 'pointer_up' } as any)
		expect(open).not.toHaveBeenCalled()
	})

	it('ignores a pointerdown that is not on a link', () => {
		const target = mountLabel()
		const rich = target.querySelector('.tl-text-content > .tl-rich-text')!
		const down = new Event('pointerdown', { bubbles: true, cancelable: true })
		rich.dispatchEvent(down)
		expect(down.defaultPrevented).toBe(false)
	})

	describe('while the shape is being edited', () => {
		beforeEach(() => {
			test.editor.setEditingShape(id)
		})

		it('shows the rich text area with the contenteditable editor and marks the label as editing', async () => {
			const target = mountLabel({ richText: richText('') })
			await flush(150)
			const wrapper = target.querySelector<HTMLElement>('.tl-text-wrapper')!
			expect(wrapper).not.toBeNull()
			expect(wrapper.getAttribute('aria-hidden')).toBe('false')
			expect(wrapper.dataset.isediting).toBe('true')
			const area = target.querySelector<HTMLElement>('[data-testid="rich-text-area"]')!
			expect(area.className).toBe('tl-rich-text tl-text tl-text-input')
			expect(area.getAttribute('tabindex')).toBe('-1')
			expect(area.querySelector('[contenteditable="true"]')).not.toBeNull()
			// the editor exposes the TipTap editor to the rest of the app
			expect(test.editor.getRichTextEditor()).not.toBeNull()
		})

		it('writes edits made in the TipTap editor to the shape', async () => {
			mountLabel({ richText: richText('') })
			await flush(150)
			test.editor.getRichTextEditor()!.commands.insertContent('typed')
			expect((test.editor.getShape(id) as any).props.richText).toEqual({
				type: 'doc',
				attrs: { dir: 'auto' },
				content: [
					{ type: 'paragraph', attrs: { dir: 'auto' }, content: [{ type: 'text', text: 'typed' }] },
				],
			})
		})

		it('inserts a tab character on Tab instead of leaving the editor, unless the tab behaviour is custom', async () => {
			const target = mountLabel({ richText: richText('') })
			await flush(150)
			const contentEditable = target.querySelector<HTMLElement>('[contenteditable="true"]')!
			const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
			contentEditable.dispatchEvent(tab)
			expect(tab.defaultPrevented).toBe(true)
			expect(JSON.stringify((test.editor.getShape(id) as any).props.richText)).toContain('\\t')
		})

		it('completes editing on accel + enter', async () => {
			const complete = vi.spyOn(test.editor, 'complete')
			const target = mountLabel()
			await flush(150)
			const contentEditable = target.querySelector<HTMLElement>('[contenteditable="true"]')!
			contentEditable.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
			)
			expect(complete).not.toHaveBeenCalled()
			contentEditable.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'Enter',
					ctrlKey: true,
					metaKey: true,
					bubbles: true,
					cancelable: true,
				})
			)
			expect(complete).toHaveBeenCalledTimes(1)
		})

		it('stops pointerdown from reaching ancestors of the rich text area', async () => {
			const target = mountLabel()
			await flush(150)
			const area = target.querySelector<HTMLElement>('[data-testid="rich-text-area"]')!
			const atContainer = vi.fn()
			test.container.addEventListener('pointerdown', atContainer)
			area.dispatchEvent(new Event('pointerdown', { bubbles: true, cancelable: true }))
			expect(atContainer).not.toHaveBeenCalled()
		})

		it('destroys the TipTap editor when editing stops', async () => {
			const target = mountLabel()
			await flush(150)
			expect(target.querySelector('[contenteditable]')).not.toBeNull()
			test.editor.setEditingShape(null)
			flushSync()
			await flush()
			expect(target.querySelector('[contenteditable]')).toBeNull()
		})
	})
})
