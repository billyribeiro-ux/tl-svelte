import {
	BaseFrameLikeShapeUtil,
	Circle2d,
	type Geometry2d,
	Group2d,
	Rectangle2d,
	ShapeUtil,
	type TLShape,
	shapeView,
} from 'svelte-draw'
import CounterShape from './CounterShape.svelte'
import GridShape from './GridShape.svelte'

export const MY_GRID_SHAPE_TYPE = 'my-grid-shape'
export const MY_COUNTER_SHAPE_TYPE = 'my-counter-shape'

// [1]
declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[MY_GRID_SHAPE_TYPE]: { w: number; h: number }
		[MY_COUNTER_SHAPE_TYPE]: Record<string, never>
	}
}

// [2]
type MyGridShape = TLShape<typeof MY_GRID_SHAPE_TYPE>
type MyCounterShape = TLShape<typeof MY_COUNTER_SHAPE_TYPE>

// [3]
const SLOT_SIZE = 100
export class MyCounterShapeUtil extends ShapeUtil<MyCounterShape> {
	static override type = MY_COUNTER_SHAPE_TYPE

	override canResize(_shape: MyCounterShape) {
		return false
	}
	override hideResizeHandles(_shape: MyCounterShape) {
		return true
	}

	getDefaultProps(): MyCounterShape['props'] {
		return {}
	}

	getGeometry(): Geometry2d {
		return new Circle2d({ radius: SLOT_SIZE / 2 - 10, isFilled: true })
	}

	component() {
		return shapeView(CounterShape, {})
	}

	getIndicatorPath() {
		const path = new Path2D()
		path.arc(SLOT_SIZE / 2 - 10, SLOT_SIZE / 2 - 10, SLOT_SIZE / 2 - 10, 0, Math.PI * 2)
		return path
	}
}

// [4]
export class MyGridShapeUtil extends BaseFrameLikeShapeUtil<MyGridShape> {
	static override type = MY_GRID_SHAPE_TYPE

	getDefaultProps(): MyGridShape['props'] {
		return {
			w: SLOT_SIZE * 5,
			h: SLOT_SIZE * 2,
		}
	}

	// Frame-like shapes must return a Group2d: the editor's hit testing walks its children.
	override getGeometry(shape: MyGridShape): Geometry2d {
		return new Group2d({
			children: [new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: true })],
		})
	}

	override canResize(_shape: MyGridShape) {
		return false
	}

	override hideResizeHandles(_shape: MyGridShape) {
		return true
	}

	// [5]
	override canReceiveNewChildrenOfType(_shape: MyGridShape, type: TLShape['type']) {
		return type === MY_COUNTER_SHAPE_TYPE
	}

	// [6]
	override canRemoveChildrenOfType(_shape: MyGridShape, type: TLShape['type']) {
		return type !== MY_COUNTER_SHAPE_TYPE
	}

	// [7]
	component(shape: MyGridShape) {
		return shapeView(GridShape, { w: shape.props.w, h: shape.props.h, slotSize: SLOT_SIZE })
	}

	override getIndicatorPath(shape: MyGridShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
