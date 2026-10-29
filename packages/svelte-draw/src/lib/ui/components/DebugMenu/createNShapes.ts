import { createShapeId, type Editor, type TLShapePartial } from '@svelte-draw/editor'

/** @internal */
export function createNShapes(editor: Editor, n: number) {
	const gap = editor.options.adjacentShapeMargin
	const shapesToCreate: TLShapePartial[] = Array(n)
	const cols = Math.floor(Math.sqrt(n))
	const { x, y } = editor.getViewportPageBounds()

	for (let i = 0; i < n; i++) {
		shapesToCreate[i] = {
			id: createShapeId(),
			type: 'geo',
			x: x + (i % cols) * (100 + gap),
			y: y + Math.floor(i / cols) * (100 + gap),
		}
	}

	editor.markHistoryStoppingPoint('create n shapes')
	editor.run(() => {
		// allow this to trigger the max shapes alert
		editor.createShapes(shapesToCreate).setSelectedShapes(shapesToCreate.map((s) => s.id))
	})
}
