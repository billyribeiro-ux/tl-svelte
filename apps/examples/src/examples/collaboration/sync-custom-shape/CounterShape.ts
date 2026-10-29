import {
	BaseBoxShapeTool,
	BaseBoxShapeUtil,
	shapeView,
	T,
	type TLShape,
	type TLShapeId,
} from 'svelte-draw'
import CounterShapeComponent from './CounterShapeComponent.svelte'

const COUNTER_TYPE = 'counter'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[COUNTER_TYPE]: { w: number; h: number; count: number }
	}
}

export type CounterShape = TLShape<typeof COUNTER_TYPE>

export class CounterShapeUtil extends BaseBoxShapeUtil<CounterShape> {
	static override type = COUNTER_TYPE
	static override props = {
		w: T.positiveNumber,
		h: T.positiveNumber,
		count: T.number,
	}

	override getDefaultProps() {
		return {
			w: 200,
			h: 200,
			count: 0,
		}
	}

	override component(shape: CounterShape) {
		return shapeView(CounterShapeComponent, {
			shapeId: shape.id as TLShapeId,
			count: shape.props.count,
		})
	}

	override getIndicatorPath(shape: CounterShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

export class CounterShapeTool extends BaseBoxShapeTool {
	static override id = 'counter'
	override shapeType = 'counter' as const
}
