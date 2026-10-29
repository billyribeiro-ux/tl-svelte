import { createShapeId, type Editor } from '@svelte-draw/editor'
import { flushSync } from 'svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderSvelteDraw, type RenderedSvelteDraw } from '../svelte/renderSvelteDraw'

let editor: Editor
let rendered: RenderedSvelteDraw

beforeEach(async () => {
	rendered = await renderSvelteDraw({}, { waitForPatterns: false })
	editor = rendered.editor
})

afterEach(() => {
	rendered.unmount()
})

function moveFocusToCanvas() {
	;(document.querySelector('.tl-skip-to-main-content') as HTMLElement).click()
	flushSync()
}

describe('Move focus to canvas', () => {
	it('selects the first shape in reading order', () => {
		const box1 = createShapeId()
		const box2 = createShapeId()
		editor.createShapes([
			{ id: box1, type: 'geo', x: 0, y: 0 },
			{ id: box2, type: 'geo', x: 200, y: 0 },
		])
		flushSync()

		moveFocusToCanvas()

		expect(editor.getSelectedShapeIds()).toEqual([box1])
	})

	it('selects a locked first shape', () => {
		const locked = createShapeId()
		const unlocked = createShapeId()
		editor.createShapes([
			{ id: locked, type: 'geo', x: 0, y: 0, isLocked: true },
			{ id: unlocked, type: 'geo', x: 200, y: 0 },
		])
		flushSync()

		moveFocusToCanvas()

		expect(editor.getSelectedShapeIds()).toEqual([locked])
	})
})
