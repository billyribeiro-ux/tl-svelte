import {
	Circle2d,
	Group2d,
	Rectangle2d,
	ShapeUtil,
	shapeView,
	type RecordProps,
	type TLShape,
} from 'svelte-draw'
import { NODE_WIDTH_PX, PORT_RADIUS_PX } from '../constants'
import { getNodePorts } from './nodePorts'
import NodeShapeComponent from './NodeShape.svelte'
import { getNodeDefinition, getNodeHeightPx, getNodeWidthPx, NodeType } from './nodeTypes'

const NODE_TYPE = 'node'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[NODE_TYPE]: { node: NodeType }
	}
}

// Define our custom node shape type that extends svelte-draw's base shape system
export type NodeShape = TLShape<typeof NODE_TYPE>

// This class extends svelte-draw's ShapeUtil to define how our custom node shapes behave
export class NodeShapeUtil extends ShapeUtil<NodeShape> {
	static override type = NODE_TYPE
	static override props: RecordProps<NodeShape> = {
		node: NodeType,
	}

	getDefaultProps(): NodeShape['props'] {
		return {
			node: getNodeDefinition(this.editor, 'message').getDefault(),
		}
	}

	override canEdit(_shape: NodeShape) {
		return false
	}
	override canResize(_shape: NodeShape) {
		return false
	}
	override hideResizeHandles(_shape: NodeShape) {
		return true
	}
	override hideRotateHandle(_shape: NodeShape) {
		return true
	}
	override hideSelectionBoundsBg(_shape: NodeShape) {
		return true
	}
	override hideSelectionBoundsFg(_shape: NodeShape) {
		return true
	}
	override isAspectRatioLocked(_shape: NodeShape) {
		return false
	}
	override getBoundsSnapGeometry(_shape: NodeShape) {
		return {
			points: [{ x: 0, y: 0 }],
		}
	}

	// Define the geometry of our node shape including ports
	getGeometry(shape: NodeShape) {
		const ports = getNodePorts(this.editor, shape)

		const portGeometries = Object.values(ports).map(
			(port) =>
				new Circle2d({
					x: port.x - PORT_RADIUS_PX,
					y: port.y - PORT_RADIUS_PX,
					radius: PORT_RADIUS_PX,
					isFilled: true,
					// not a label, but this hack excludes them from the selection bounds which is useful
					isLabel: true,
				})
		)

		const bodyGeometry = new Rectangle2d({
			width: getNodeWidthPx(this.editor, shape),
			height: getNodeHeightPx(this.editor, shape),
			isFilled: true,
		})

		return new Group2d({
			children: [bodyGeometry, ...portGeometries],
		})
	}

	component(shape: NodeShape) {
		return shapeView(NodeShapeComponent, { shape })
	}

	getIndicatorPath(shape: NodeShape) {
		const height = getNodeHeightPx(this.editor, shape)
		const path = new Path2D()
		path.rect(0, 0, NODE_WIDTH_PX, height)
		const ports = getNodePorts(this.editor, shape)
		for (const port of Object.values(ports)) {
			path.moveTo(port.x + PORT_RADIUS_PX, port.y)
			path.arc(port.x, port.y, PORT_RADIUS_PX, 0, Math.PI * 2)
		}
		return path
	}
}
