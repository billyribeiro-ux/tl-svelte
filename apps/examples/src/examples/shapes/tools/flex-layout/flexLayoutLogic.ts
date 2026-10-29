import {
	Box,
	type Editor,
	Rectangle2d,
	type TLShape,
	type TLShapeId,
	type TLShapePartial,
	canonicalizeRotation,
	clamp,
	createShapeId,
	getIndicesBetween,
	last,
	toDomPrecision,
} from 'svelte-draw'
import {
	FLEX_CONTAINER_DEFAULT_LABEL,
	getChildPositions,
	getDesiredSize,
	getDropInLineStyle,
	getDropOutLineStyle,
	type FlexContainerLayoutProps,
	type FrameLabelBoxShape,
} from './FlexContainerHelpers'

// There's a guide at the bottom of FlexLayoutExample.svelte!

export const FLEX_LAYOUT_SHAPE_TYPE = 'flex-layout'
export const FLEX_LAYOUT_ID = createShapeId('flex-layout-example')

// [1]
declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[FLEX_LAYOUT_SHAPE_TYPE]: FlexContainerLayoutProps & {
			w: number
			h: number
		}
	}
}

// [2]
export type FlexLayoutShape = TLShape<typeof FLEX_LAYOUT_SHAPE_TYPE>

// [3]
const FRAME_HEADING_EXTRA_WIDTH = 12
const FRAME_HEADING_MIN_WIDTH = 32
const FRAME_HEADING_NOCOLORS_OFFSET_X = -7
const FRAME_HEADING_OFFSET_Y = 4

export function getContainerHeadingSide(editor: Editor, shape: FrameLabelBoxShape): 0 | 1 | 2 | 3 {
	const pageRotation = canonicalizeRotation(editor.getShapePageTransform(shape.id)!.rotation())
	const offsetRotation = pageRotation + Math.PI / 4
	const scaledRotation = (offsetRotation * (2 / Math.PI) + 4) % 4
	return Math.floor(scaledRotation) as 0 | 1 | 2 | 3
}

function getContainerHeadingOpts(width: number) {
	return {
		fontSize: 12,
		fontFamily: 'Inter, sans-serif',
		textAlign: 'start' as const,
		width,
		height: 24,
		padding: 0,
		lineHeight: 1,
		fontStyle: 'normal',
		fontWeight: 'normal',
		overflow: 'truncate-ellipsis' as const,
		verticalTextAlign: 'middle' as const,
		offsetY: -(32 + 2),
		offsetX: 0,
	}
}

function getContainerHeadingSize(
	editor: Editor,
	shape: FrameLabelBoxShape,
	opts: ReturnType<typeof getContainerHeadingOpts>,
	label: string
) {
	const spans = editor.textMeasure.measureTextSpans(label, opts)
	const firstSpan = spans[0]
	const lastSpan = last(spans)!
	const width = lastSpan.box.w + lastSpan.box.x - firstSpan.box.x

	return new Box(0, -opts.height, width, opts.height)
}

export function getContainerHeadingTranslation(shape: FrameLabelBoxShape, side: 0 | 1 | 2 | 3) {
	const u = 'px'
	const r = 'deg'
	switch (side) {
		case 0:
			return ''
		case 3:
			return `translate(${toDomPrecision(shape.props.w)}${u}, 0${u}) rotate(90${r})`
		case 2:
			return `translate(${toDomPrecision(shape.props.w)}${u}, ${toDomPrecision(shape.props.h)}${u}) rotate(180${r})`
		case 1:
			return `translate(0${u}, ${toDomPrecision(shape.props.h)}${u}) rotate(270${r})`
		default:
			throw Error('labelSide out of bounds')
	}
}

export function getFlexContainerLabelGeometry(
	editor: Editor,
	shape: FrameLabelBoxShape,
	label = FLEX_CONTAINER_DEFAULT_LABEL
) {
	const z = editor.getEfficientZoomLevel()
	const labelSide = getContainerHeadingSide(editor, shape)
	const isVertical = labelSide % 2 === 1
	const rotatedTopEdgeWidth = isVertical ? shape.props.h : shape.props.w

	const opts = getContainerHeadingOpts(rotatedTopEdgeWidth)
	const headingSize = getContainerHeadingSize(editor, shape, opts, label)

	const extraWidth = FRAME_HEADING_EXTRA_WIDTH / z
	const minWidth = FRAME_HEADING_MIN_WIDTH / z
	const maxWidth = rotatedTopEdgeWidth + extraWidth

	const labelWidth = headingSize.w / z
	const labelHeight = headingSize.h / z
	const clampedLabelWidth = clamp(labelWidth + extraWidth, minWidth, maxWidth)

	const offsetX = FRAME_HEADING_NOCOLORS_OFFSET_X / z
	const offsetY = FRAME_HEADING_OFFSET_Y / z

	const width = isVertical ? labelHeight : clampedLabelWidth
	const height = isVertical ? clampedLabelWidth : labelHeight

	let x: number
	let y: number

	switch (labelSide) {
		case 0:
			x = offsetX
			y = -(labelHeight + offsetY)
			break
		case 1:
			x = -(labelHeight + offsetY)
			y = shape.props.h - (offsetX + clampedLabelWidth)
			break
		case 2:
			x = shape.props.w - (offsetX + clampedLabelWidth)
			y = shape.props.h + offsetY
			break
		case 3:
			x = shape.props.w + offsetY
			y = offsetX
			break
	}

	return new Rectangle2d({
		x,
		y,
		width,
		height,
		isFilled: true,
		isLabel: true,
		excludeFromShapeBounds: true,
	})
}

// [7]
export function getFlexLayoutChildren(editor: Editor, shapeId: TLShapeId) {
	return editor
		.getSortedChildIdsForParent(shapeId)
		.map((id) => editor.getShape(id))
		.filter((child): child is TLShape => !!child)
}

export function getIsTranslatingSelectedChild(editor: Editor, shape: FlexLayoutShape) {
	return (
		editor.getPath() === 'select.translating' &&
		editor.getSelectedShapes().some((selectedShape) => selectedShape.parentId === shape.id)
	)
}

export function getDropIndex(editor: Editor, shape: FlexLayoutShape, movingShapes: TLShape[]) {
	const movingIds = new Set(movingShapes.map((movingShape) => movingShape.id))
	const children = editor
		.getSortedChildIdsForParent(shape.id)
		.map((id) => editor.getShape(id))
		.filter((child): child is TLShape => !!child && !movingIds.has(child.id))

	const point = editor.getPointInShapeSpace(shape, editor.inputs.getCurrentPagePoint())
	const axis = shape.props.direction === 'horizontal' ? 'x' : 'y'

	for (let i = 0; i < children.length; i++) {
		const child = children[i]
		const bounds = editor.getShapeGeometry(child).bounds
		const midpoint = child[axis] + (axis === 'x' ? bounds.width : bounds.height) / 2
		if (point[axis] < midpoint) return i
	}

	return children.length
}

export function dropShapesIntoLayout(
	editor: Editor,
	shape: FlexLayoutShape,
	shapes: TLShape[],
	dropIndex: number
) {
	const shapesToDrop = shapes.filter((movingShape) => {
		if (movingShape.id === shape.id) return false
		return !editor.hasAncestor(shape, movingShape.id)
	})
	if (shapesToDrop.length === 0) return

	const movingIds = new Set(shapesToDrop.map((movingShape) => movingShape.id))
	const remainingChildren = editor
		.getSortedChildIdsForParent(shape.id)
		.map((id) => editor.getShape(id))
		.filter((child): child is TLShape => !!child && !movingIds.has(child.id))

	const nextChildren = [...remainingChildren]
	nextChildren.splice(dropIndex, 0, ...shapesToDrop)
	const indices = getIndicesBetween(undefined, undefined, nextChildren.length)
	const desiredSize = getDesiredSize(editor, shape, nextChildren)
	const childPositions = getChildPositions(editor, shape, nextChildren, desiredSize)

	editor.run(() => {
		editor.reparentShapes(shapesToDrop, shape.id)
		editor.updateShape<FlexLayoutShape>({
			id: shape.id,
			type: shape.type,
			props: desiredSize,
		})
		editor.updateShapes(
			nextChildren.map((child, index) => ({
				id: child.id,
				type: child.type,
				index: indices[index],
				...childPositions[index],
			})) as TLShapePartial[]
		)
	})
}

export function relayoutFlexLayoutChildren(editor: Editor, shapeId: TLShapeId) {
	const shape = editor.getShape(shapeId) as FlexLayoutShape | undefined
	if (!shape) return

	const children = getFlexLayoutChildren(editor, shapeId)
	if (children.length === 0) return

	const childPositions = getChildPositions(editor, shape, children)

	editor.updateShapes(
		children.map((child, index) => ({
			id: child.id,
			type: child.type,
			...childPositions[index],
		})) as TLShapePartial[]
	)
}

export function resizeFlexLayoutToChildren(editor: Editor, shapeId: TLShapeId) {
	const shape = editor.getShape(shapeId) as FlexLayoutShape | undefined
	if (!shape) return

	const children = getFlexLayoutChildren(editor, shapeId)
	const desiredSize = getDesiredSize(editor, shape, children)
	if (
		Math.abs(shape.props.w - desiredSize.w) < 0.5 &&
		Math.abs(shape.props.h - desiredSize.h) < 0.5
	) {
		return
	}

	editor.updateShape<FlexLayoutShape>({
		id: shape.id,
		type: shape.type,
		props: desiredSize,
	})
}

export function getDropIndicator(editor: Editor, shape: FlexLayoutShape, children: TLShape[]) {
	if (editor.getPath() !== 'select.translating') return null

	const pagePoint = editor.inputs.getCurrentPagePoint()
	const point = editor.getPointInShapeSpace(shape, pagePoint)
	const isInside = editor.isPointInShape(shape.id, pagePoint, { hitInside: true })

	const selectedShapes = editor.getSelectedShapes()
	const isDraggingChild = selectedShapes.some(
		(selectedShape) => selectedShape.parentId === shape.id
	)
	const isDraggingOver = editor.getHintingShapeIds().includes(shape.id)

	if (isInside && (isDraggingOver || isDraggingChild)) {
		return {
			type: 'in',
			style: getDropInLineStyle(
				editor,
				shape,
				children,
				getDropIndex(editor, shape, selectedShapes)
			),
		} as const
	}

	if (isDraggingChild) {
		return {
			type: 'out',
			style: getDropOutLineStyle(shape, point),
		} as const
	}

	return null
}
