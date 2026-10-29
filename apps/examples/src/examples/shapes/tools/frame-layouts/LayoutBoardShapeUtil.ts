import {
	BaseFrameLikeShapeUtil,
	EASINGS,
	type Editor,
	type Geometry2d,
	Group2d,
	type RecordProps,
	Rectangle2d,
	T,
	type TLDragShapesOutInfo,
	type TLShape,
	type TLShapeId,
	type TLShapePartial,
	shapeView,
} from 'svelte-draw'
import BoardComponent from './BoardComponent.svelte'
import {
	BOARD_HEADER_HEIGHT,
	BOARD_PADDING,
	type BoardLayoutMode,
	arrangeBoard,
} from './BoardLayouts'
import { NOTE_CARD_SHAPE_TYPE, VIDEO_CARD_SHAPE_TYPE } from './MediaCardShapes'

// There's a guide at the bottom of FrameLayoutsExample.svelte!

export const BOARD_SHAPE_TYPE = 'layout-board'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[BOARD_SHAPE_TYPE]: { w: number; h: number; name: string; layout: BoardLayoutMode }
	}
}

export type BoardShape = TLShape<typeof BOARD_SHAPE_TYPE>

// [1]
export class LayoutBoardShapeUtil extends BaseFrameLikeShapeUtil<BoardShape> {
	static override type = BOARD_SHAPE_TYPE
	static override props: RecordProps<BoardShape> = {
		w: T.nonZeroNumber,
		h: T.nonZeroNumber,
		name: T.string,
		layout: T.literalEnum('free', 'row', 'column', 'grid', 'spotlight'),
	}

	override getDefaultProps(): BoardShape['props'] {
		return { w: 320, h: 240, name: 'Board', layout: 'free' }
	}

	// [2]
	override canReceiveNewChildrenOfType(shape: BoardShape, type: TLShape['type']) {
		if (shape.isLocked) return false
		return type === VIDEO_CARD_SHAPE_TYPE || type === NOTE_CARD_SHAPE_TYPE
	}

	// [3]
	override canResize(shape: BoardShape) {
		return shape.props.layout === 'free'
	}

	override hideResizeHandles(shape: BoardShape) {
		return shape.props.layout !== 'free'
	}

	override canResizeChildren() {
		return false
	}

	// [4]
	override getGeometry(shape: BoardShape): Geometry2d {
		return new Group2d({
			children: [
				new Rectangle2d({ width: shape.props.w, height: shape.props.h, isFilled: false }),
				new Rectangle2d({
					width: shape.props.w,
					height: BOARD_HEADER_HEIGHT,
					isFilled: true,
					isLabel: true,
				}),
			],
		})
	}

	// [5]
	override onChildrenChange(shape: BoardShape) {
		if (this.editor.isIn('select.translating')) return
		return getBoardLayoutChanges(this.editor, shape)
	}

	// [6]
	override onDropShapesOver(shape: BoardShape) {
		animateBoardLayout(this.editor, shape.id)
	}

	override onDragShapesOut(shape: BoardShape, shapes: TLShape[], info: TLDragShapesOutInfo) {
		super.onDragShapesOut(shape, shapes, info)
		animateBoardLayout(this.editor, shape.id)
	}

	override component(shape: BoardShape) {
		return shapeView(BoardComponent, {
			id: shape.id,
			w: shape.props.w,
			h: shape.props.h,
			name: shape.props.name,
			layout: shape.props.layout,
		})
	}

	override getText(shape: BoardShape) {
		return shape.props.name
	}

	override getIndicatorPath(shape: BoardShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

const EPSILON = 0.01

// [7]
function getBoardLayoutChanges(editor: Editor, board: BoardShape): TLShapePartial[] {
	const children = editor
		.getSortedChildIdsForParent(board.id)
		.map((id) => editor.getShape(id))
		.filter((child): child is TLShape => !!child)
		.map((child) => ({ child, size: editor.getShapeGeometry(child).bounds }))

	const byId = new Map(children.map((entry) => [entry.child.id, entry]))
	const originX = BOARD_PADDING
	const originY = BOARD_HEADER_HEIGHT + BOARD_PADDING

	const result = arrangeBoard(
		board.props.layout,
		children.map(({ child, size }) => ({
			id: child.id,
			x: child.x - originX,
			y: child.y - originY,
			w: size.width,
			h: size.height,
		}))
	)
	if (!result) return []

	const changes: TLShapePartial[] = []

	for (const box of result.boxes) {
		const { child, size } = byId.get(box.id)!
		const x = originX + box.x
		const y = originY + box.y
		const moved = Math.abs(child.x - x) > EPSILON || Math.abs(child.y - y) > EPSILON
		const resized =
			Math.abs(size.width - box.w) > EPSILON || Math.abs(size.height - box.h) > EPSILON
		if (!moved && !resized) continue
		changes.push({
			id: child.id,
			type: child.type,
			x,
			y,
			...(resized && { props: { w: box.w, h: box.h } }),
		} as TLShapePartial)
	}

	if (
		Math.abs(board.props.w - result.w) > EPSILON ||
		Math.abs(board.props.h - result.h) > EPSILON
	) {
		changes.push({ id: board.id, type: board.type, props: { w: result.w, h: result.h } })
	}

	return changes
}

export function applyBoardLayout(editor: Editor, boardId: TLShapeId) {
	const board = editor.getShape<BoardShape>(boardId)
	if (board) editor.updateShapes(getBoardLayoutChanges(editor, board))
}

export function animateBoardLayout(editor: Editor, boardId: TLShapeId) {
	const board = editor.getShape<BoardShape>(boardId)
	if (!board) return
	editor.animateShapes(getBoardLayoutChanges(editor, board), {
		animation: { duration: 220, easing: EASINGS.easeInOutCubic },
	})
}
