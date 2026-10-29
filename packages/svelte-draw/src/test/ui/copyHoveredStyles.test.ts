import { Box, DefaultColorStyle, Editor, createShapeId } from '@svelte-draw/editor'
import { afterEach, describe, expect, it } from 'vitest'
import type { TLUiActionsContextType } from '../../lib/ui/context/actions.svelte'
import ActionCapturer from '../svelte/fixtures/ActionCapturer.svelte'
import { act, renderSvelteDraw, type RenderedSvelteDraw } from '../svelte/renderSvelteDraw'

let rendered: RenderedSvelteDraw | undefined
afterEach(() => rendered?.unmount())

// Move the pointer so the editor's current page point is over a given location. The
// copy-hovered-styles action hit-tests this point, which also drills into groups.
function movePointerTo(editor: Editor, x: number, y: number) {
	act(() => {
		editor.dispatch({
			type: 'pointer',
			target: 'canvas',
			name: 'pointer_move',
			point: { x, y },
			pointerId: 1,
			button: 0,
			isPen: false,
			shiftKey: false,
			altKey: false,
			ctrlKey: false,
			metaKey: false,
			accelKey: false,
		})
		editor.emit('tick', 16)
	})
}

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
	const { editor } = rendered

	// The action hit-tests rendering shapes, so give the editor a real viewport.
	act(() => {
		editor.updateViewportScreenBounds(new Box(0, 0, 1000, 800))
	})

	return { editor, copyHoveredStyles: actions!['copy-hovered-styles'] }
}

describe('copy-hovered-styles action', () => {
	it('copies styles from the shape under the pointer in any tool idle state', async () => {
		const { editor, copyHoveredStyles } = await setup()

		const redId = createShapeId()
		editor.createShapes([
			{
				id: redId,
				type: 'geo',
				x: 0,
				y: 0,
				props: { w: 100, h: 100, color: 'red', fill: 'solid' },
			},
		])

		// Point at the red shape.
		movePointerTo(editor, 50, 50)

		// From the select tool's idle state, the red shape's color is copied to the next shape.
		editor.setStyleForNextShapes(DefaultColorStyle, 'black')
		editor.setCurrentTool('select.idle')
		expect(editor.getPath()).toBe('select.idle')
		await copyHoveredStyles.onSelect('kbd')
		expect(editor.getStyleForNextShape(DefaultColorStyle)).toBe('red')

		// It also runs from another tool's idle state, like geo.idle.
		editor.setStyleForNextShapes(DefaultColorStyle, 'black')
		editor.setCurrentTool('geo')
		expect(editor.getPath()).toBe('geo.idle')
		await copyHoveredStyles.onSelect('kbd')
		expect(editor.getStyleForNextShape(DefaultColorStyle)).toBe('red')
	})

	it('does nothing when the tool is not in an idle state', async () => {
		const { editor, copyHoveredStyles } = await setup()

		const redId = createShapeId()
		editor.createShapes([
			{
				id: redId,
				type: 'geo',
				x: 0,
				y: 0,
				props: { w: 100, h: 100, color: 'red', fill: 'solid' },
			},
		])

		movePointerTo(editor, 50, 50)

		// Brushing is not an idle state, so the action is a no-op.
		editor.setStyleForNextShapes(DefaultColorStyle, 'black')
		editor.setCurrentTool('select.brushing')
		expect(editor.getPath()).toBe('select.brushing')
		await copyHoveredStyles.onSelect('kbd')
		expect(editor.getStyleForNextShape(DefaultColorStyle)).toBe('black')
	})

	it('copies styles from the child under the cursor when pointing inside a group', async () => {
		const { editor, copyHoveredStyles } = await setup()

		const redId = createShapeId()
		const blueId = createShapeId()
		editor.createShapes([
			{
				id: redId,
				type: 'geo',
				x: 0,
				y: 0,
				props: { w: 100, h: 100, color: 'red', fill: 'solid' },
			},
			{
				id: blueId,
				type: 'geo',
				x: 200,
				y: 0,
				props: { w: 100, h: 100, color: 'blue', fill: 'solid' },
			},
		])
		editor.setSelectedShapes([redId, blueId])
		editor.groupShapes(editor.getSelectedShapeIds())
		const groupId = editor.getOnlySelectedShapeId()!
		expect(editor.isShapeOfType(editor.getShape(groupId)!, 'group')).toBe(true)
		editor.selectNone()
		editor.setCurrentTool('select.idle')

		// The whole group is highlighted, but the hit test drills into it: pointing at the
		// red child copies red, and pointing at the blue child copies blue.
		editor.setStyleForNextShapes(DefaultColorStyle, 'black')
		movePointerTo(editor, 50, 50)
		await copyHoveredStyles.onSelect('kbd')
		expect(editor.getStyleForNextShape(DefaultColorStyle)).toBe('red')

		editor.setStyleForNextShapes(DefaultColorStyle, 'black')
		movePointerTo(editor, 250, 50)
		await copyHoveredStyles.onSelect('kbd')
		expect(editor.getStyleForNextShape(DefaultColorStyle)).toBe('blue')
	})
})
