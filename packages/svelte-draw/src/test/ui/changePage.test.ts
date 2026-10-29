import { Editor, PageRecordType, type TLPageId, createShapeId } from '@svelte-draw/editor'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TLUiActionsContextType } from '../../lib/ui/context/actions.svelte'
import ActionCapturer from '../svelte/fixtures/ActionCapturer.svelte'
import {
	act,
	fireEvent,
	renderSvelteDraw,
	screen,
	type RenderedSvelteDraw,
} from '../svelte/renderSvelteDraw'

let rendered: RenderedSvelteDraw
let editor: Editor
let actions: TLUiActionsContextType
let page1Id: TLPageId
let page2Id: TLPageId
let boxId: ReturnType<typeof createShapeId>

beforeEach(async () => {
	// jsdom has no Element.scrollTo, which the page menu calls to reveal the current page.
	Element.prototype.scrollTo = vi.fn()

	rendered = await renderSvelteDraw(
		{},
		{
			waitForPatterns: false,
			child: ActionCapturer,
			childProps: { onCapture: (a: TLUiActionsContextType) => (actions = a) },
		}
	)
	editor = rendered.editor

	page1Id = editor.getCurrentPageId()
	page2Id = PageRecordType.createId()
	boxId = createShapeId()

	// Set up a second page outside of history so the only undoable steps are the ones the
	// test creates: one edit on page 1, then a page switch.
	editor.run(
		() => {
			editor.createPage({ id: page2Id, name: 'Page 2' })
		},
		{ history: 'ignore' }
	)
	editor.clearHistory()

	act(() => {
		editor.markHistoryStoppingPoint('create box')
		editor.createShapes([{ id: boxId, type: 'geo', x: 0, y: 0, props: { w: 100, h: 100 } }])
	})
	expect(editor.getShape(boxId)).toBeDefined()
	expect(editor.getCurrentPageId()).toBe(page1Id)
})

afterEach(() => {
	rendered.unmount()
	editor?.dispose()
})

function expectUndoToOnlyRevertThePageSwitch() {
	expect(editor.getCurrentPageId()).toBe(page2Id)

	act(() => {
		editor.undo()
	})

	// The first undo only takes us back to page 1; the edit made there is still intact.
	expect(editor.getCurrentPageId()).toBe(page1Id)
	expect(editor.getShape(boxId)).toBeDefined()

	act(() => {
		editor.undo()
	})
	expect(editor.getShape(boxId)).toBeUndefined()
}

describe('undo after switching pages', () => {
	it('change-page-next action is its own undo step', async () => {
		await act(async () => {
			await actions['change-page-next'].onSelect('kbd')
		})
		expectUndoToOnlyRevertThePageSwitch()
	})

	it('change-page-prev action is its own undo step', async () => {
		// Start on page 2 (outside of history) so prev lands on page 1, and put the edit there.
		editor.run(
			() => {
				editor.setCurrentPage(page2Id)
			},
			{ history: 'ignore' }
		)
		editor.clearHistory()
		const page2BoxId = createShapeId()
		act(() => {
			editor.markHistoryStoppingPoint('create box')
			editor.createShapes([{ id: page2BoxId, type: 'geo', x: 0, y: 0, props: { w: 100, h: 100 } }])
		})

		await act(async () => {
			await actions['change-page-prev'].onSelect('kbd')
		})

		expect(editor.getCurrentPageId()).toBe(page1Id)
		act(() => {
			editor.undo()
		})
		expect(editor.getCurrentPageId()).toBe(page2Id)
		expect(editor.getShape(page2BoxId)).toBeDefined()
		act(() => {
			editor.undo()
		})
		expect(editor.getShape(page2BoxId)).toBeUndefined()
	})

	it('switching pages from the page menu is its own undo step', async () => {
		await act(async () => {
			fireEvent.click(screen.getByTestId('page-menu.button'))
		})
		const item = (await screen.findAllByTestId('page-menu.item')).find(
			(el) => el.getAttribute('data-pageid') === page2Id
		)!
		expect(item).toBeDefined()
		await act(async () => {
			fireEvent.click(item.querySelector('.tlui-page-menu__item__button')!)
		})
		expectUndoToOnlyRevertThePageSwitch()
	})
})
