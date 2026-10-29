import {
	Geometry2d,
	type RecordProps,
	Rectangle2d,
	ShapeUtil,
	T,
	type TLResizeInfo,
	type TLShape,
	resizeBox,
	shapeView,
} from 'svelte-draw'
import CustomShapeComponent from './CustomShapeComponent.svelte'

export const MY_CUSTOM_SHAPE_TYPE = 'my-custom-shape'

// [1]
declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[MY_CUSTOM_SHAPE_TYPE]: { w: number; h: number; text: string }
	}
}

// [2]
export type ICustomShape = TLShape<typeof MY_CUSTOM_SHAPE_TYPE>

// [3]
export class MyShapeUtil extends ShapeUtil<ICustomShape> {
	// [a]
	static override type = MY_CUSTOM_SHAPE_TYPE
	static override props: RecordProps<ICustomShape> = {
		w: T.number,
		h: T.number,
		text: T.string,
	}

	// [b]
	getDefaultProps(): ICustomShape['props'] {
		return {
			w: 200,
			h: 200,
			text: "I'm a shape!",
		}
	}

	// [c]
	override canEdit(_shape: ICustomShape) {
		return false
	}
	override canResize(_shape: ICustomShape) {
		return true
	}
	override isAspectRatioLocked(_shape: ICustomShape) {
		return false
	}

	// [d]
	getGeometry(shape: ICustomShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	// [e]
	override onResize(shape: ICustomShape, info: TLResizeInfo<ICustomShape>) {
		return resizeBox(shape, info)
	}

	// [f]
	component(shape: ICustomShape) {
		return shapeView(CustomShapeComponent, { text: shape.props.text })
	}

	// [g]
	getIndicatorPath(shape: ICustomShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
