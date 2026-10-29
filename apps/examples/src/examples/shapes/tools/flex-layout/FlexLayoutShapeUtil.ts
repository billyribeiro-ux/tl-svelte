import {
	BaseFrameLikeShapeUtil,
	type Geometry2d,
	Group2d,
	type RecordProps,
	Rectangle2d,
	T,
	type TLDragShapesOutInfo,
	type TLResizeInfo,
	type TLShape,
	resizeBox,
	shapeView,
} from 'svelte-draw'
import { FLEX_CONTAINER_DEFAULT_LABEL, getMinimumContentSize } from './FlexContainerHelpers'
import {
	FLEX_LAYOUT_SHAPE_TYPE,
	type FlexLayoutShape,
	dropShapesIntoLayout,
	getDropIndex,
	getFlexContainerLabelGeometry,
	getFlexLayoutChildren,
	relayoutFlexLayoutChildren,
	resizeFlexLayoutToChildren,
} from './flexLayoutLogic'
import FlexLayoutShapeComponent from './FlexLayoutShape.svelte'

// [4]
export class FlexLayoutShapeUtil extends BaseFrameLikeShapeUtil<FlexLayoutShape> {
	static override type = FLEX_LAYOUT_SHAPE_TYPE
	static override props: RecordProps<FlexLayoutShape> = {
		w: T.nonZeroNumber,
		h: T.nonZeroNumber,
		direction: T.literalEnum('horizontal', 'vertical'),
		align: T.literalEnum('start', 'center', 'end'),
		justify: T.literalEnum('start', 'center', 'end', 'space-between'),
	}

	override canResize() {
		return true
	}

	override canResizeChildren() {
		return false
	}

	override getDefaultProps(): FlexLayoutShape['props'] {
		return {
			w: 420,
			h: 240,
			direction: 'horizontal',
			align: 'center',
			justify: 'center',
		}
	}

	override getGeometry(shape: FlexLayoutShape): Geometry2d {
		return new Group2d({
			children: [
				new Rectangle2d({
					width: shape.props.w,
					height: shape.props.h,
					isFilled: false,
				}),
				getFlexContainerLabelGeometry(this.editor, shape, FLEX_CONTAINER_DEFAULT_LABEL),
			],
		})
	}

	override getText(_shape: FlexLayoutShape) {
		return FLEX_CONTAINER_DEFAULT_LABEL
	}

	override getAriaDescriptor(_shape: FlexLayoutShape) {
		return FLEX_CONTAINER_DEFAULT_LABEL
	}

	override component(shape: FlexLayoutShape) {
		return shapeView(FlexLayoutShapeComponent, { shape })
	}

	// [4a]
	override onResize(shape: FlexLayoutShape, info: TLResizeInfo<FlexLayoutShape>) {
		const children = getFlexLayoutChildren(this.editor, shape.id)
		const minimum = getMinimumContentSize(this.editor, shape, children)
		return resizeBox(shape, info, {
			minWidth: minimum.w,
			minHeight: minimum.h,
		})
	}

	override onResizeEnd(_initialShape: FlexLayoutShape, currentShape: FlexLayoutShape) {
		relayoutFlexLayoutChildren(this.editor, currentShape.id)
	}

	// [4b]
	override onDragShapesOut(shape: FlexLayoutShape, shapes: TLShape[], info: TLDragShapesOutInfo) {
		if (info.nextDraggingOverShapeId) return

		const childrenToMove = shapes.filter((movingShape) => movingShape.parentId === shape.id)
		if (!childrenToMove.length) return

		this.editor.reparentShapes(childrenToMove, this.editor.getCurrentPageId())
		resizeFlexLayoutToChildren(this.editor, shape.id)
	}

	// [4c]
	override onDropShapesOver(shape: FlexLayoutShape, shapes: TLShape[]) {
		const dropIndex = getDropIndex(this.editor, shape, shapes)
		dropShapesIntoLayout(this.editor, shape, shapes, dropIndex)
	}

	// [4d]
	override onTranslateEnd(_initialShape: FlexLayoutShape, currentShape: FlexLayoutShape) {
		resizeFlexLayoutToChildren(this.editor, currentShape.id)
	}

	override getIndicatorPath(shape: FlexLayoutShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
