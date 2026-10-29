import {
	Geometry2d,
	type RecordProps,
	Rectangle2d,
	ShapeUtil,
	T,
	type TLShape,
	shapeView,
} from 'svelte-draw'
import PulseShapeComponent from './PulseShape.svelte'

export const PULSE_SHAPE_TYPE = 'pulse-shape'

// [1]
declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[PULSE_SHAPE_TYPE]: { w: number; h: number }
	}
}

type PulseShape = TLShape<typeof PULSE_SHAPE_TYPE>

// [3]
export class PulseShapeUtil extends ShapeUtil<PulseShape> {
	static override type = PULSE_SHAPE_TYPE
	static override props: RecordProps<PulseShape> = {
		w: T.number,
		h: T.number,
	}

	getDefaultProps(): PulseShape['props'] {
		return { w: 200, h: 200 }
	}

	getGeometry(shape: PulseShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component() {
		return shapeView(PulseShapeComponent, {})
	}

	getIndicatorPath(shape: PulseShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
