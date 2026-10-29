import {
	Box,
	createShapeId,
	DefaultColorStyle,
	Editor,
	type TLArrowShape,
} from '@svelte-draw/editor'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
	act,
	fireEvent,
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

	act(() => {
		// jsdom has no layout, so the container measures 0px wide and the UI lays out as mobile (no
		// docked style panel). Give it a desktop-sized viewport.
		editor.updateViewportScreenBounds(new Box(0, 0, 1280, 800))
		editor.user.updateUserPreferences({ colorScheme: 'light' })
		editor.setStyleForNextShapes(DefaultColorStyle, 'black')
	})
})

afterEach(() => rendered.unmount())

function getBlackColorSwatch() {
	return screen.getByTestId('style.color.black') as HTMLElement
}

describe('StylePanel', () => {
	it('updates the black color swatch when switching color modes', async () => {
		await screen.findByTestId('style.color.black')

		expect(getBlackColorSwatch().style.color).toBe('rgb(29, 29, 29)')

		act(() => {
			editor.user.updateUserPreferences({ colorScheme: 'dark' })
		})

		await waitFor(() => {
			expect(getBlackColorSwatch().style.color).toBe('rgb(242, 242, 242)')
		})

		act(() => {
			editor.user.updateUserPreferences({ colorScheme: 'light' })
		})

		await waitFor(() => {
			expect(getBlackColorSwatch().style.color).toBe('rgb(29, 29, 29)')
		})
	})

	it('marks an undo step when changing an arrowhead', async () => {
		const id = createShapeId()
		act(() => {
			editor
				.createShapes<TLArrowShape>([
					{
						id,
						type: 'arrow',
						x: 100,
						y: 100,
						props: { start: { x: 0, y: 0 }, end: { x: 100, y: 100 } },
					},
				])
				.selectNone()
			editor.markHistoryStoppingPoint('before selecting arrow')
			editor.select(id)
		})

		fireEvent.click(await screen.findByTestId('style.arrowheadEnd'))
		fireEvent.click(await screen.findByTestId('style.arrowheadEnd.none'))

		expect(editor.getShape<TLArrowShape>(id)!.props.arrowheadEnd).toBe('none')

		act(() => {
			editor.undo()
		})

		expect(editor.getShape<TLArrowShape>(id)!.props.arrowheadEnd).toBe('arrow')
		expect(editor.getSelectedShapeIds()).toEqual([id])
	})
})
