import {
	Geometry2d,
	Rectangle2d,
	ShapeUtil,
	T,
	resizeBox,
	shapeView,
	type RecordProps,
	type TLResizeInfo,
	type TLShape,
} from 'svelte-draw'
import { getSlides, moveToSlide } from './slides'
import SlideShapeView from './SlideShapeView.svelte'

const SLIDE_TYPE = 'slide'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[SLIDE_TYPE]: {
			w: number
			h: number
		}
	}
}

export type SlideShape = TLShape<typeof SLIDE_TYPE>

export class SlideShapeUtil extends ShapeUtil<SlideShape> {
	static override type = SLIDE_TYPE
	static override props: RecordProps<SlideShape> = {
		w: T.number,
		h: T.number,
	}

	override canBind() {
		return false
	}
	override hideRotateHandle() {
		return true
	}

	getDefaultProps(): SlideShape['props'] {
		return {
			w: 720,
			h: 480,
		}
	}

	getGeometry(shape: SlideShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: false,
		})
	}

	// [1]
	override onRotate(initial: SlideShape) {
		return initial
	}

	override onResize(shape: SlideShape, info: TLResizeInfo<SlideShape>) {
		return resizeBox(shape, info)
	}

	override onDoubleClick(shape: SlideShape) {
		moveToSlide(this.editor, shape)
		this.editor.selectNone()
	}

	override onDoubleClickEdge(shape: SlideShape) {
		moveToSlide(this.editor, shape)
		this.editor.selectNone()
	}

	component(shape: SlideShape) {
		const bounds = this.editor.getShapeGeometry(shape).bounds

		// [2]
		// `InnerShape` runs `component()` under signal tracking, so the editor reads below keep the
		// view current (replacing `useValue`).
		const zoomLevel = this.editor.getZoomLevel()

		const slides = getSlides(this.editor)
		const index = slides.findIndex((s) => s.id === shape.id)

		if (!bounds) return null

		return shapeView(SlideShapeView, {
			sides: bounds.sides,
			zoomLevel,
			index,
			onLabelPointerDown: () => this.editor.select(shape.id),
		})
	}

	getIndicatorPath(shape: SlideShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

/*
[1]
Slides can't be rotated: the rotate handle is hidden and `onRotate` returns the initial
shape so rotation via other paths (e.g. the context menu's rotate actions) is a no-op.

[2]
The dashed border is drawn with `getPerfectDashProps` at a length scaled to the zoom level,
so the dashes stay the same size on screen at any zoom, and falls back to a solid line when
zoomed far out.

[3]
The geometry is unfilled, so clicking inside a slide selects the shapes on it rather than
the slide. The label in the corner is the one place a pointer-down selects the slide itself.
*/
