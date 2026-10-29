import { createShapeId, Editor, type TLImageShape } from '@svelte-draw/editor'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
	act,
	fireEvent,
	renderSvelteDraw,
	screen,
	type RenderedSvelteDraw,
} from '../svelte/renderSvelteDraw'

let editor: Editor
let rendered: RenderedSvelteDraw
const imageId = createShapeId('image') as TLImageShape['id']

beforeEach(async () => {
	rendered = await renderSvelteDraw({}, { waitForPatterns: false })
	editor = rendered.editor

	act(() => {
		editor.createShapes([{ id: imageId, type: 'image', x: 0, y: 0, props: { w: 100, h: 100 } }])
		editor.select(imageId)
	})
})

afterEach(() => {
	rendered.unmount()
	editor?.dispose()
})

async function enterCropMode() {
	act(() => {
		editor.setCroppingShape(imageId)
		editor.setCurrentTool('select.crop.idle')
	})
	const slider = await screen.findByTestId('tool.image-zoom')
	return slider.querySelector('.tlui-slider__thumb') as HTMLElement
}

describe('Image toolbar in crop mode', () => {
	it('keeps the image selected when Escape is pressed on the zoom slider', async () => {
		const thumb = await enterCropMode()

		act(() => {
			fireEvent.keyDown(thumb, { key: 'Escape' })
		})

		expect(editor.getCroppingShapeId()).toBe(null)
		expect(editor.isIn('select.idle')).toBe(true)
		expect(editor.getSelectedShapeIds()).toEqual([imageId])
	})

	it('keeps the image selected when Enter is pressed on the zoom slider', async () => {
		const thumb = await enterCropMode()

		act(() => {
			fireEvent.keyDown(thumb, { key: 'Enter' })
		})

		expect(editor.getCroppingShapeId()).toBe(null)
		expect(editor.isIn('select.idle')).toBe(true)
		expect(editor.getSelectedShapeIds()).toEqual([imageId])
	})
})
