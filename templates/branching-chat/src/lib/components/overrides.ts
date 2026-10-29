import {
	createShapeId,
	onDragFromToolbarToCreateShape,
	type Editor,
	type TLShapeId,
	type TLUiOverrides,
	type Vec,
} from 'svelte-draw'
import type { NodeShape } from '../nodes/NodeShapeUtil'
import { getNodeDefinitions, type NodeType } from '../nodes/nodeTypes'

function createNodeShape(editor: Editor, shapeId: TLShapeId, center: Vec, node: NodeType) {
	// Mark a history stopping point for undo/redo
	editor.markHistoryStoppingPoint('create node')

	editor.run(() => {
		// Create the shape with the node definition
		editor.createShape({
			id: shapeId,
			type: 'node',
			props: { node },
		})

		// Get the created shape and its bounds
		const shape = editor.getShape<NodeShape>(shapeId)!
		const shapeBounds = editor.getShapePageBounds(shapeId)!

		// Position the shape so its center aligns with the drop point
		editor.updateShape({
			...shape,
			x: center.x - shapeBounds.width / 2,
			y: center.y - shapeBounds.height / 2,
		})

		// Select the newly created shape
		editor.select(shapeId)
	})
}

export const overrides: TLUiOverrides = {
	tools: (editor, tools, _) => {
		for (const nodeDef of Object.values(getNodeDefinitions(editor))) {
			tools[`node-${nodeDef.type}`] = {
				id: `node-${nodeDef.type}`,
				label: nodeDef.title,
				icon: nodeDef.icon,
				onSelect: () => {
					createNodeShape(
						editor,
						createShapeId(),
						editor.getViewportPageBounds().center,
						nodeDef.getDefault()
					)
				},
				onDragStart: (_, info) => {
					onDragFromToolbarToCreateShape(editor, info, {
						createShape: (id) => {
							editor.createShape({
								id,
								type: 'node',
								props: { node: nodeDef.getDefault() },
							})
						},
						onDragEnd: () => {},
					})
				},
			}
		}
		return tools
	},
}
