import { Box, type BoxModel, type Editor, type TLShapeId } from 'svelte-draw'
import { getNodePortConnections } from '../nodes/nodePorts'
import type { NodeShape } from '../nodes/NodeShapeUtil'

/**
 * A workflow region is a set of connected shapes. Each shape should only belong to a single
 * workflow region: connecting two shapes from separate regions will cause them to be merged into a
 * single region.
 */
export interface WorkflowRegion {
	bounds: BoxModel
	nodes: Set<TLShapeId>
	startingNodes: Set<TLShapeId>
}

// Find all workflow regions by traversing connected nodes in the canvas
export function findWorkflowRegions(editor: Editor): WorkflowRegion[] {
	const workflowSetsByShape = new Map<TLShapeId, Set<TLShapeId>>()
	const visitedNodes = new Set<TLShapeId>()

	// Recursively visit connected nodes to build workflow regions
	function visit(node: NodeShape, currentWorkflow?: Set<TLShapeId>) {
		if (visitedNodes.has(node.id)) return
		visitedNodes.add(node.id)

		if (!currentWorkflow) {
			currentWorkflow = new Set()
		}

		workflowSetsByShape.set(node.id, currentWorkflow)
		currentWorkflow.add(node.id)

		for (const connection of getNodePortConnections(editor, node)) {
			visit(editor.getShape(connection.connectedShapeId) as NodeShape, currentWorkflow)
		}
	}

	// Start visiting from all nodes in the current page
	for (const node of editor.getCurrentPageShapes()) {
		if (editor.isShapeOfType(node, 'node')) {
			visit(node)
		}
	}

	// Convert workflow sets to Workflow objects with bounds and starting nodes
	return Array.from(new Set(workflowSetsByShape.values()), (nodeIds): WorkflowRegion => {
		let bounds: Box | null = null
		const startingNodes = new Set<TLShapeId>()

		for (const nodeId of nodeIds) {
			// Check if this node has input connections (end ports)
			// If not, it's a starting node
			const hasInputs = getNodePortConnections(editor, nodeId).some((c) => c.terminal === 'end')
			if (!hasInputs) {
				startingNodes.add(nodeId)
			}

			// Get the node's bounds in page space
			const nodeBounds = editor.getShapePageBounds(nodeId)
			if (!nodeBounds) continue

			// Union all node bounds to create workflow bounds
			if (bounds) {
				bounds.union(nodeBounds)
			} else {
				bounds = Box.From(nodeBounds)
			}
		}

		return {
			bounds: bounds!.expandBy(30), // Add padding around the workflow
			nodes: nodeIds,
			startingNodes,
		}
	}).filter((w) => w.nodes.size > 1) // Only show workflows with multiple nodes
}
