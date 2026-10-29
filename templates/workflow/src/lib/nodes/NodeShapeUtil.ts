import {
	Circle2d,
	Group2d,
	Rectangle2d,
	ShapeUtil,
	T,
	resizeBox,
	shapeView,
	type RecordProps,
	type TLResizeInfo,
	type TLShape,
} from 'svelte-draw'
import { NODE_WIDTH_PX, PORT_RADIUS_PX } from '../constants'
import { getNodePorts } from './nodePorts'
import NodeShapeComponent from './NodeShape.svelte'
import { getNodeDefinition, getNodeHeightPx, NodeType } from './nodeTypes'

const NODE_TYPE = 'node'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		// Define our custom node shape type that extends svelte-draw's base shape system
		[NODE_TYPE]: { node: NodeType; isOutOfDate: boolean }
	}
}

export type NodeShape = TLShape<typeof NODE_TYPE>

// This class extends svelte-draw's ShapeUtil to define how our custom node shapes behave
export class NodeShapeUtil extends ShapeUtil<NodeShape> {
	static override type = NODE_TYPE
	static override props: RecordProps<NodeShape> = {
		node: NodeType,
		isOutOfDate: T.boolean,
	}

	getDefaultProps(): NodeShape['props'] {
		return {
			node: getNodeDefinition(this.editor, 'add').getDefault(),
			isOutOfDate: false,
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
					excludeFromShapeBounds: true,
				})
		)

		const bodyGeometry = new Rectangle2d({
			width: NODE_WIDTH_PX,
			height: getNodeHeightPx(this.editor, shape),
			isFilled: true,
		})

		return new Group2d({
			children: [bodyGeometry, ...portGeometries],
		})
	}

	override onResize(shape: any, info: TLResizeInfo<any>) {
		return resizeBox(shape, info)
	}

	component(shape: NodeShape) {
		return shapeView(NodeShapeComponent, { shape })
	}

	getIndicatorPath(shape: NodeShape) {
		const height = getNodeHeightPx(this.editor, shape)
		const path = new Path2D()
		path.rect(0, 0, NODE_WIDTH_PX, height)
		const ports = Object.values(getNodePorts(this.editor, shape))
		for (const port of ports) {
			path.moveTo(port.x + PORT_RADIUS_PX, port.y)
			path.arc(port.x, port.y, PORT_RADIUS_PX, 0, Math.PI * 2)
		}
		return path
	}
}
