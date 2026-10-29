import { createShapeId, type Editor } from 'svelte-draw'
import type { NodeType } from '../nodes/nodeTypes'

export function createNodeAtCenter(editor: Editor, node: NodeType) {
	const shapeId = createShapeId()
	editor.run(() => {
		editor.createShape({
			id: shapeId,
			type: 'node',
			props: { node },
		})
		const shapeBounds = editor.getShapePageBounds(shapeId)!
		const center = editor.getViewportPageBounds().center
		editor.updateShape({
			id: shapeId,
			type: 'node',
			x: center.x - shapeBounds.width / 2,
			y: center.y - shapeBounds.height / 2,
		})
		editor.select(shapeId)
	})
}
