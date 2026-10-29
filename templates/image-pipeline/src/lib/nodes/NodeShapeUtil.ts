import {
	Circle2d,
	Group2d,
	Rectangle2d,
	resizeBox,
	ShapeUtil,
	shapeView,
	T,
	type RecordProps,
	type TLResizeInfo,
	type TLShape,
} from 'svelte-draw'
import {
	NODE_FOOTER_HEIGHT_PX,
	NODE_HEADER_HEIGHT_PX,
	NODE_ROW_BOTTOM_PADDING_PX,
	NODE_ROW_HEADER_GAP_PX,
	PORT_RADIUS_PX,
} from '../constants'
import { getNodePorts } from './nodePorts'
import NodeShapeComponent from './NodeShapeComponent.svelte'
import { getNodeDefinition, getNodeHeightPx, getNodeWidthPx, NodeType } from './nodeTypes'
import { resizeNode } from './resizeNode'

const NODE_TYPE = 'node'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[NODE_TYPE]: { node: NodeType; isOutOfDate: boolean }
	}
}

export type NodeShape = TLShape<typeof NODE_TYPE>

export class NodeShapeUtil extends ShapeUtil<NodeShape> {
	static override type = NODE_TYPE
	static override props: RecordProps<NodeShape> = {
		node: NodeType,
		isOutOfDate: T.boolean,
	}

	getDefaultProps(): NodeShape['props'] {
		return {
			node: getNodeDefinition(this.editor, 'prompt').getDefault(),
			isOutOfDate: false,
		}
	}

	override canEdit(_shape: NodeShape) {
		return false
	}
	override canResize(shape: NodeShape) {
		return getNodeDefinition(this.editor, shape.props.node).canResizeNode
	}
	override hideResizeHandles(shape: NodeShape) {
		return !this.canResize(shape)
	}
	override hideRotateHandle(_shape: NodeShape) {
		return true
	}
	override hideSelectionBoundsBg(shape: NodeShape) {
		return !this.canResize(shape)
	}
	override hideSelectionBoundsFg(shape: NodeShape) {
		return !this.canResize(shape)
	}
	override isAspectRatioLocked(_shape: NodeShape) {
		return false
	}
	override getBoundsSnapGeometry(_shape: NodeShape) {
		return {
			points: [{ x: 0, y: 0 }],
		}
	}

	getGeometry(shape: NodeShape) {
		const ports = getNodePorts(this.editor, shape)
		const width = getNodeWidthPx(this.editor, shape)

		const portGeometries = Object.values(ports).map(
			(port) =>
				new Circle2d({
					x: port.x - PORT_RADIUS_PX,
					y: port.y - PORT_RADIUS_PX,
					radius: PORT_RADIUS_PX,
					isFilled: true,
					isLabel: true,
					excludeFromShapeBounds: true,
				})
		)

		const bodyGeometry = new Rectangle2d({
			width,
			height: getNodeHeightPx(this.editor, shape),
			isFilled: true,
		})

		return new Group2d({
			children: [bodyGeometry, ...portGeometries],
		})
	}

	override onResize(shape: any, info: TLResizeInfo<any>) {
		const definition = getNodeDefinition(this.editor, shape.props.node)
		if (definition.canResizeNode) {
			const node = shape.props.node as { w: number; h: number; type: string }
			const prevW = getNodeWidthPx(this.editor, shape)
			const prevH = getNodeHeightPx(this.editor, shape)
			const newW = Math.max(200, Math.round(prevW * info.scaleX))
			const newH = Math.max(120, Math.round(prevH * info.scaleY))
			const bodyH =
				newH -
				NODE_HEADER_HEIGHT_PX -
				NODE_ROW_HEADER_GAP_PX -
				NODE_ROW_BOTTOM_PADDING_PX -
				NODE_FOOTER_HEIGHT_PX

			return {
				...resizeNode(shape, info),
				props: {
					...shape.props,
					node: {
						...node,
						w: newW,
						h:
							NODE_HEADER_HEIGHT_PX +
							NODE_ROW_HEADER_GAP_PX +
							Math.max(0, bodyH) +
							NODE_ROW_BOTTOM_PADDING_PX +
							NODE_FOOTER_HEIGHT_PX,
					},
				},
			}
		}
		return resizeBox(shape, info)
	}

	component(shape: NodeShape) {
		return shapeView(NodeShapeComponent, { shape })
	}

	getIndicatorPath(shape: NodeShape) {
		const width = getNodeWidthPx(this.editor, shape)
		const height = getNodeHeightPx(this.editor, shape)
		const path = new Path2D()
		path.rect(0, 0, width, height)
		const ports = Object.values(getNodePorts(this.editor, shape))
		for (const port of ports) {
			path.moveTo(port.x + PORT_RADIUS_PX, port.y)
			path.arc(port.x, port.y, PORT_RADIUS_PX, 0, Math.PI * 2)
		}
		return path
	}
}
