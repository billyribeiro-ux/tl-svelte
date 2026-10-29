import { Box, type BoxModel, type Editor, type TLShapeId } from 'svelte-draw'
import { getNodePortConnections } from '../nodes/nodePorts'
import type { NodeShape } from '../nodes/NodeShapeUtil'

export interface PipelineRegion {
	bounds: BoxModel
	nodes: Set<TLShapeId>
	startingNodes: Set<TLShapeId>
}

export function findPipelineRegions(editor: Editor): PipelineRegion[] {
	const regionsByShape = new Map<TLShapeId, Set<TLShapeId>>()
	const visitedNodes = new Set<TLShapeId>()

	function visit(node: NodeShape, currentRegion?: Set<TLShapeId>) {
		if (visitedNodes.has(node.id)) return
		visitedNodes.add(node.id)

		if (!currentRegion) {
			currentRegion = new Set()
		}

		regionsByShape.set(node.id, currentRegion)
		currentRegion.add(node.id)

		for (const connection of getNodePortConnections(editor, node)) {
			visit(editor.getShape(connection.connectedShapeId) as NodeShape, currentRegion)
		}
	}

	for (const node of editor.getCurrentPageShapes()) {
		if (editor.isShapeOfType(node, 'node')) {
			visit(node)
		}
	}

	return Array.from(new Set(regionsByShape.values()), (nodeIds): PipelineRegion => {
		let bounds: Box | null = null
		const startingNodes = new Set<TLShapeId>()

		for (const nodeId of nodeIds) {
			const hasInputs = getNodePortConnections(editor, nodeId).some((c) => c.terminal === 'end')
			if (!hasInputs) {
				startingNodes.add(nodeId)
			}

			const nodeBounds = editor.getShapePageBounds(nodeId)
			if (!nodeBounds) continue

			if (bounds) {
				bounds.union(nodeBounds)
			} else {
				bounds = Box.From(nodeBounds)
			}
		}

		return {
			bounds: bounds!.expandBy(30),
			nodes: nodeIds,
			startingNodes,
		}
	}).filter((w) => w.nodes.size > 1)
}
