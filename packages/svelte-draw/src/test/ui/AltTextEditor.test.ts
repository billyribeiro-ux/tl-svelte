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
const imageId = createShapeId('image')

beforeEach(async () => {
	rendered = await renderSvelteDraw({}, { waitForPatterns: false })
	editor = rendered.editor

	act(() => {
		editor.createShape<TLImageShape>({
			id: imageId,
			type: 'image',
			x: 100,
			y: 100,
			props: { w: 200, h: 200 },
		})
		editor.markHistoryStoppingPoint('move image')
		editor.updateShape({ id: imageId, type: 'image', x: 300 })
		editor.select(imageId)
	})
})

afterEach(() => rendered.unmount())

describe('AltTextEditor', () => {
	it('undoes only the alt text change, not the action before it', async () => {
		fireEvent.click(await screen.findByTestId('tool.image-alt-text'))

		const input = (await screen.findByTestId('media-toolbar.alt-text-input')) as HTMLInputElement
		// React's `onChange` listens to the native `input` event; Svelte's `oninput` does too, so
		// the event to fire is `input` (a bare `change` event reaches neither).
		fireEvent.input(input, { target: { value: 'A picture' } })
		fireEvent.keyDown(input, { key: 'Enter' })

		expect(editor.getShape<TLImageShape>(imageId)).toMatchObject({
			x: 300,
			props: { altText: 'A picture' },
		})

		act(() => {
			editor.undo()
		})

		expect(editor.getShape<TLImageShape>(imageId)).toMatchObject({
			x: 300,
			props: { altText: '' },
		})
	})
})
