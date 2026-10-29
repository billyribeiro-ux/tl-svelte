import {
	BaseFrameLikeShapeUtil,
	DefaultColorStyle,
	Geometry2d,
	Group2d,
	Rectangle2d,
	Vec,
	clamp,
	compact,
	frameShapeMigrations,
	frameShapeProps,
	getColorValue,
	lerp,
	shapeView,
	type SvgExportContext,
	type TLClickEventInfo,
	type TLEditStartInfo,
	type TLFrameShape,
	type TLFrameShapeProps,
	type TLShapePartial,
	type TLShapeUtilConstructor,
} from '@svelte-draw/editor'
import { fitFrameToContent, getFrameChildrenBounds } from '../../utils/frames/frames'
import {
	createTextJsxFromSpans,
	type TLCreateTextJsxFromSpansOpts,
} from '../shared/createTextJsxFromSpans'
import { getDisplayValues, type ShapeOptionsWithDisplayValues } from '../shared/getDisplayValues'
import FrameShapeBody from './components/FrameShapeBody.svelte'
import {
	defaultEmptyAs,
	getFrameHeadingOpts,
	getFrameHeadingSide,
	getFrameHeadingSize,
	getFrameHeadingTranslation,
} from './frameHelpers'
import FrameShapeExport from './FrameShapeExport.svelte'

// Some of these values are repeated in CSS and need to match
const FRAME_HEADING_EXTRA_WIDTH = 12
const FRAME_HEADING_MIN_WIDTH = 32
const FRAME_HEADING_NOCOLORS_OFFSET_X = -7
const FRAME_HEADING_OFFSET_Y = 4

/** @public */
export interface FrameShapeUtilDisplayValues {
	fillColor: string
	strokeColor: string
	showColorsFillColor: string
	showColorsStrokeColor: string
	headingFillColor: string
	headingStrokeColor: string
	headingTextColor: string
	showColorsHeadingFillColor: string
	showColorsHeadingStrokeColor: string
	showColorsHeadingTextColor: string
}

/** @public */
export interface FrameShapeOptions extends ShapeOptionsWithDisplayValues<
	TLFrameShape,
	FrameShapeUtilDisplayValues
> {
	/**
	 * When true, the frame will display colors for the shape's headings and background.
	 */
	showColors: boolean
	/**
	 * When true, the frame will resize its children when the frame itself is resized.
	 */
	resizeChildren: boolean
}

/** @public */
export class FrameShapeUtil extends BaseFrameLikeShapeUtil<TLFrameShape> {
	static override type = 'frame' as const
	static override props = frameShapeProps
	static override migrations = frameShapeMigrations

	override options: FrameShapeOptions = {
		showColors: false,
		resizeChildren: false,
		getDefaultDisplayValues(_editor, shape, theme, colorMode): FrameShapeUtilDisplayValues {
			const { color } = shape.props
			const colors = theme.colors[colorMode]
			return {
				fillColor: getColorValue(colors, 'black', 'frameFill'),
				strokeColor: getColorValue(colors, 'black', 'frameStroke'),
				showColorsFillColor: getColorValue(colors, color, 'frameFill'),
				showColorsStrokeColor: getColorValue(colors, color, 'frameStroke'),
				headingFillColor: colors.negativeSpace,
				headingStrokeColor: colors.negativeSpace,
				headingTextColor: getColorValue(colors, 'black', 'frameText'),
				showColorsHeadingFillColor: getColorValue(colors, color, 'frameHeadingFill'),
				showColorsHeadingStrokeColor: getColorValue(colors, color, 'frameHeadingStroke'),
				showColorsHeadingTextColor: getColorValue(colors, color, 'frameText'),
			}
		},
		getCustomDisplayValues(): Partial<FrameShapeUtilDisplayValues> {
			return {}
		},
	}

	// evil crimes :)
	// By default, showColors is off. Because they use style props, which are picked up
	// automatically, we don't have DefaultColorStyle in the props in the schema by default.
	// Instead, when someone calls .configure to turn the option on, we manually add in the color
	// style here so it plays nicely with the other editor APIs.
	static override configure<T extends TLShapeUtilConstructor<any, any>>(
		this: T,
		options: T extends new (...args: any[]) => { options: infer Options } ? Partial<Options> : never
	): T {
		const withOptions = super.configure.call(this, options) as T
		if ((options as any).showColors) {
			;(withOptions as any).props = { ...withOptions.props, color: DefaultColorStyle }
		}
		return withOptions
	}

	override canEdit(shape: TLFrameShape, info: TLEditStartInfo) {
		return info.type === 'click-header' || info.type === 'unknown'
	}

	override canResize(shape: TLFrameShape) {
		return true
	}

	override canResizeChildren(shape: TLFrameShape) {
		return this.options.resizeChildren
	}

	override isExportBoundsContainer(): boolean {
		return true
	}

	override getDefaultProps(): TLFrameShape['props'] {
		return { w: 160 * 2, h: 90 * 2, name: '', color: 'black' }
	}

	override getAriaDescriptor(shape: TLFrameShape) {
		return shape.props.name
	}

	override getGeometry(shape: TLFrameShape): Geometry2d {
		const { editor } = this

		const z = editor.getEfficientZoomLevel()

		// Which dimension measures the top edge after rotation?
		const labelSide = getFrameHeadingSide(editor, shape)
		const isVertical = labelSide % 2 === 1
		const rotatedTopEdgeWidth = isVertical ? shape.props.h : shape.props.w

		// Get the size of the heading (max width equal to the rotatedTopEdgeWidth)
		const opts = getFrameHeadingOpts(rotatedTopEdgeWidth, false)
		const headingSize = getFrameHeadingSize(editor, shape, opts)

		// If NOT showing frame colors, we need to offset the label
		// to the left so that the title is in line with the shape edge
		// and add that extra width to the right side of the label
		const isShowingFrameColors = this.options.showColors

		// Scale everything into **screen space**
		const extraWidth = FRAME_HEADING_EXTRA_WIDTH / z
		const minWidth = FRAME_HEADING_MIN_WIDTH / z
		const maxWidth = rotatedTopEdgeWidth + (isShowingFrameColors ? 1 : extraWidth)

		const labelWidth = headingSize.w / z
		const labelHeight = headingSize.h / z

		const clampedLabelWidth = clamp(labelWidth + extraWidth, minWidth, maxWidth)

		const offsetX = (isShowingFrameColors ? -1 : FRAME_HEADING_NOCOLORS_OFFSET_X) / z
		const offsetY = FRAME_HEADING_OFFSET_Y / z

		// In page space
		const width = isVertical ? labelHeight : clampedLabelWidth
		const height = isVertical ? clampedLabelWidth : labelHeight

		// Calculate label position based on side. The position needs to always appear
		// at the top left of the shape, regardless of rotation. The label must be
		// between a minimum and maximum. The minimum is arbitrary; the maximum is the
		// width of the edge of the frame where the label will be shown.

		let x: number, y: number

		switch (labelSide) {
			case 0: {
				// top
				x = offsetX
				y = -(labelHeight + offsetY)
				break
			}
			case 1: {
				// right
				x = -(labelHeight + offsetY)
				y = shape.props.h - (offsetX + clampedLabelWidth)
				break
			}
			case 2: {
				// bottom
				x = shape.props.w - (offsetX + clampedLabelWidth)
				y = shape.props.h + offsetY
				break
			}
			case 3: {
				// left
				x = shape.props.w + offsetY
				y = offsetX
				break
			}
		}

		return new Group2d({
			children: [
				new Rectangle2d({
					width: shape.props.w,
					height: shape.props.h,
					isFilled: false,
				}),
				new Rectangle2d({
					x,
					y,
					width,
					height,
					isFilled: true,
					isLabel: true,
					excludeFromShapeBounds: true,
				}),
			],
		})
	}

	override getText(shape: TLFrameShape): string | undefined {
		return shape.props.name
	}

	override component(shape: TLFrameShape) {
		// `InnerShape` runs this under signal tracking (the old `useStateTracking`), so reading the
		// editor here keeps the view up to date.
		const dv = getDisplayValues(this, shape, this.editor.getColorMode())

		const isCreating = (() => {
			const resizingState = this.editor.getStateDescendant('select.resizing')
			if (!resizingState) return false
			if (!resizingState.getIsActive()) return false
			const info = (resizingState as typeof resizingState & { info: { isCreating: boolean } })?.info
			if (!info) return false
			return info.isCreating && this.editor.getOnlySelectedShapeId() === shape.id
		})()

		const showFrameColors = this.options.showColors

		return shapeView(FrameShapeBody, {
			id: shape.id,
			name: shape.props.name,
			w: shape.props.w,
			h: shape.props.h,
			isCreating,
			showColors: showFrameColors,
			fillColor: showFrameColors ? dv.showColorsFillColor : dv.fillColor,
			strokeColor: showFrameColors ? dv.showColorsStrokeColor : dv.strokeColor,
			headingFill: showFrameColors ? dv.showColorsHeadingFillColor : dv.headingFillColor,
			headingStroke: showFrameColors ? dv.showColorsHeadingStrokeColor : dv.headingStrokeColor,
			headingColor: showFrameColors ? dv.showColorsHeadingTextColor : dv.headingTextColor,
		})
	}

	override toSvg(shape: TLFrameShape, ctx: SvgExportContext) {
		const dv = getDisplayValues(this, shape, ctx.colorMode)

		// rotate right 45 deg
		const labelSide = getFrameHeadingSide(this.editor, shape)
		const isVertical = labelSide % 2 === 1
		const rotatedTopEdgeWidth = isVertical ? shape.props.h : shape.props.w
		const labelTranslate = getFrameHeadingTranslation(shape, labelSide, true)

		// Truncate with ellipsis
		const opts: TLCreateTextJsxFromSpansOpts = getFrameHeadingOpts(rotatedTopEdgeWidth - 12, true)

		const frameTitle = defaultEmptyAs(shape.props.name, 'Frame') + String.fromCharCode(8203)
		const labelBounds = getFrameHeadingSize(this.editor, shape, opts)
		const spans = this.editor.textMeasure.measureTextSpans(frameTitle, opts)
		const text = createTextJsxFromSpans(this.editor, spans, opts)

		const showFrameColors = this.options.showColors
		const frameHeadingStroke = showFrameColors
			? dv.showColorsHeadingStrokeColor
			: dv.headingStrokeColor
		const frameHeadingFill = showFrameColors ? dv.showColorsHeadingFillColor : dv.headingFillColor
		const frameHeadingText = showFrameColors ? dv.showColorsHeadingTextColor : dv.headingTextColor

		return shapeView(FrameShapeExport, {
			w: shape.props.w,
			h: shape.props.h,
			fillColor: showFrameColors ? dv.showColorsFillColor : dv.fillColor,
			strokeColor: showFrameColors ? dv.showColorsStrokeColor : dv.strokeColor,
			showColors: showFrameColors,
			labelTranslate,
			headingText: frameHeadingText,
			headingFill: frameHeadingFill,
			headingStroke: frameHeadingStroke,
			labelX: labelBounds.x - (showFrameColors ? 0 : 6),
			labelY: labelBounds.y - 6,
			labelWidth: Math.min(rotatedTopEdgeWidth, labelBounds.width + 12),
			labelHeight: labelBounds.height,
			text,
		})
	}

	override getIndicatorPath(shape: TLFrameShape): Path2D {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}

	override getInterpolatedProps(
		startShape: TLFrameShape,
		endShape: TLFrameShape,
		t: number
	): TLFrameShapeProps {
		return {
			...(t > 0.5 ? endShape.props : startShape.props),
			w: lerp(startShape.props.w, endShape.props.w, t),
			h: lerp(startShape.props.h, endShape.props.h, t),
		}
	}

	override onDoubleClickEdge(shape: TLFrameShape, info: TLClickEventInfo) {
		if (info.target !== 'selection') return
		const { handle } = info

		// If handle is missing, we can't determine which edge was clicked
		if (!handle) return

		const isHorizontalEdge = handle === 'left' || handle === 'right'
		const isVerticalEdge = handle === 'top' || handle === 'bottom'

		const childIds = this.editor.getSortedChildIdsForParent(shape.id)
		const children = compact(childIds.map((id) => this.editor.getShape(id)))
		if (!children.length) return

		const { dx, dy, w, h } = getFrameChildrenBounds(children, this.editor, { padding: 10 })

		this.editor.run(() => {
			const changes: TLShapePartial[] = childIds.map((childId) => {
				const childShape = this.editor.getShape(childId)!
				return {
					id: childShape.id,
					type: childShape.type,
					x: isHorizontalEdge ? childShape.x + dx : childShape.x,
					y: isVerticalEdge ? childShape.y + dy : childShape.y,
				}
			})

			this.editor.updateShapes(changes)
		})

		// The children were shifted by (dx, dy) in frame space; move the frame the opposite way
		// (in its parent's space) so they keep their canvas positions, as fitFrameToContent does.
		const diff = new Vec(isHorizontalEdge ? dx : 0, isVerticalEdge ? dy : 0).rot(shape.rotation)

		return {
			id: shape.id,
			type: shape.type,
			x: shape.x - diff.x,
			y: shape.y - diff.y,
			props: {
				w: isHorizontalEdge ? w : shape.props.w,
				h: isVerticalEdge ? h : shape.props.h,
			},
		}
	}

	override onDoubleClickCorner(shape: TLFrameShape) {
		fitFrameToContent(this.editor, shape.id, { padding: 10 })
		return {
			id: shape.id,
			type: shape.type,
		}
	}
}
