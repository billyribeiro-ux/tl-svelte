import {
	Circle2d,
	getIndicesAbove,
	type RecordProps,
	ShapeUtil,
	shapeView,
	T,
	type TLHandle,
	type TLHandleDragInfo,
	type TLResizeInfo,
	type TLShape,
	Vec,
	ZERO_INDEX_KEY,
} from 'svelte-draw'
import NodeComponent from './NodeComponent.svelte'

export interface NodeProps {
	opacity: number
	radius: number
}

const NODE_TYPE = 'node'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[NODE_TYPE]: NodeProps
	}
}

export type NodeShape = TLShape<'node'>

export class NodeShapeUtil extends ShapeUtil<NodeShape> {
	static override type = 'node' as const
	static override props: RecordProps<NodeShape> = {
		opacity: T.number,
		radius: T.number,
	}

	override getDefaultProps(): NodeShape['props'] {
		return {
			opacity: 1,
			radius: 50,
		}
	}

	override hideResizeHandles(_shape: NodeShape): boolean {
		return true
	}

	override hideRotateHandle(_shape: NodeShape): boolean {
		return true
	}

	override hideSelectionBoundsBg(_shape: NodeShape): boolean {
		return true
	}

	override hideSelectionBoundsFg(_shape: NodeShape): boolean {
		return true
	}

	override getGeometry(shape: NodeShape) {
		return new Circle2d({
			x: -shape.props.radius,
			y: -shape.props.radius,
			radius: shape.props.radius,
			isFilled: true,
		})
	}

	override onResize(shape: NodeShape, info: TLResizeInfo<NodeShape>) {
		const { scaleX, scaleY, initialShape } = info
		const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2

		return {
			props: {
				radius: initialShape.props.radius * avgScale,
			},
		}
	}

	override getHandles(shape: NodeShape): TLHandle[] {
		const east = Vec.Uni({ x: -1, y: 0 }).mul(shape.props.radius)
		const west = Vec.Uni({ x: 1, y: 0 }).mul(shape.props.radius)

		const indices = getIndicesAbove(ZERO_INDEX_KEY, 2)

		return [
			{
				id: 'east',
				type: 'vertex',
				index: indices[0],
				x: east.x,
				y: east.y,
			},
			{
				id: 'west',
				type: 'vertex',
				index: indices[1],
				x: west.x,
				y: west.y,
			},
		]
	}

	override onHandleDrag(shape: NodeShape, info: TLHandleDragInfo<NodeShape>) {
		const { handle, initial } = info
		if (!initial) return shape

		const mag = Vec.Len(handle) - initial.props.radius

		return {
			...shape,
			props: {
				...shape.props,
				radius: initial.props.radius + mag,
			},
		}
	}

	override getIndicatorPath(shape: NodeShape) {
		const path = new Path2D()
		path.arc(0, 0, shape.props.radius, 0, Math.PI * 2)
		return path
	}

	override component(shape: NodeShape) {
		const isSingleNode = this.editor.getBindingsToShape(shape.id, 'glob').length === 0

		return shapeView(NodeComponent, {
			opacity: shape.props.opacity,
			radius: shape.props.radius,
			isSingleNode,
		})
	}
}
