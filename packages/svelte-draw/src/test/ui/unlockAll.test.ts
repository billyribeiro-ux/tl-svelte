import { createShapeId } from '@svelte-draw/editor'
import { afterEach, describe, expect, it } from 'vitest'
import type { TLUiActionsContextType } from '../../lib/ui/context/actions.svelte'
import ActionCapturer from '../svelte/fixtures/ActionCapturer.svelte'
import { act, renderSvelteDraw, type RenderedSvelteDraw } from '../svelte/renderSvelteDraw'

let rendered: RenderedSvelteDraw
afterEach(() => rendered?.unmount())

async function setup() {
	let actions: TLUiActionsContextType | null = null
	rendered = await renderSvelteDraw(
		{},
		{
			waitForPatterns: false,
			child: ActionCapturer,
			childProps: { onCapture: (a: TLUiActionsContextType) => (actions = a) },
		}
	)
	return { editor: rendered.editor, unlockAll: actions!['unlock-all'] }
}

describe('unlock-all action', () => {
	it('marks a history stopping point so undo does not roll back earlier changes', async () => {
		const { editor, unlockAll } = await setup()

		const lockedId = createShapeId()
		const laterId = createShapeId()
		act(() => {
			editor.markHistoryStoppingPoint('create locked')
			editor.createShape({ id: lockedId, type: 'geo', x: 0, y: 0, isLocked: true })
			editor.markHistoryStoppingPoint('create later')
			editor.createShape({ id: laterId, type: 'geo', x: 200, y: 0 })
		})

		act(() => {
			unlockAll.onSelect('context-menu')
		})
		expect(editor.getShape(lockedId)!.isLocked).toBe(false)

		act(() => {
			editor.undo()
		})

		// the unlock is undone, but the shape created before it survives
		expect(editor.getShape(lockedId)!.isLocked).toBe(true)
		expect(editor.getShape(laterId)).toBeDefined()
	})
})
