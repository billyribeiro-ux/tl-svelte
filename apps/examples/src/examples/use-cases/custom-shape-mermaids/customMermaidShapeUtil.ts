import {
	BaseBoxShapeUtil,
	T,
	getColorValue,
	richTextValidator,
	shapeView,
	toRichText,
	type RecordProps,
	type TLDefaultColorStyle,
	type TLDefaultSizeStyle,
	type TLRichText,
	type TLShape,
} from 'svelte-draw'
import './customMermaidShapeUtil.css'
import FlowchartShapeView from './FlowchartShapeView.svelte'
import { pipelineStateAtom, type StepStatus } from './mermaidPipelineState'

// Same multipliers the default note and geo shapes use for their labels.
const LABEL_FONT_SIZES: Record<TLDefaultSizeStyle, number> = {
	s: 1.125,
	m: 1.375,
	l: 1.625,
	xl: 2,
}

export const CUSTOM_SHAPE_TYPE = 'flowchart-util'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[CUSTOM_SHAPE_TYPE]: {
			w: number
			h: number
			fill: string
			color: string
			dash: string
			size: string
			font: string
			richText: TLRichText
			align: string
			verticalAlign: string
			mermaidNodeId: string
			/** 1-based Kahn layer after import; set in `applyPipelineStepIndices` from the canvas DAG. */
			pipelineStepIndex: number
		}
	}
}
export type ICustomShape = TLShape<typeof CUSTOM_SHAPE_TYPE>

export class FlowchartShapeUtil extends BaseBoxShapeUtil<ICustomShape> {
	static override type = CUSTOM_SHAPE_TYPE
	static override props: RecordProps<ICustomShape> = {
		w: T.number,
		h: T.number,
		fill: T.string,
		color: T.string,
		dash: T.string,
		size: T.string,
		font: T.string,
		richText: richTextValidator,
		align: T.string,
		verticalAlign: T.string,
		mermaidNodeId: T.string,
		pipelineStepIndex: T.number,
	}

	override getDefaultProps() {
		return {
			w: 100,
			h: 100,
			fill: 'none',
			color: 'black',
			dash: 'draw',
			size: 'm',
			font: 'draw',
			richText: toRichText(''),
			align: 'middle',
			verticalAlign: 'middle',
			mermaidNodeId: '',
			pipelineStepIndex: 0,
		}
	}

	override canEdit() {
		return false
	}

	override component(shape: ICustomShape) {
		const { id, type, props } = shape
		const { editor } = this
		// `InnerShape` runs `component()` under signal tracking, so these editor and pipeline reads
		// keep the view current (replacing `useValue`).
		const theme = editor.getCurrentTheme()
		const colors = theme.colors[editor.getColorMode()]
		const pipeline = pipelineStateAtom.get()
		const status: StepStatus = props.mermaidNodeId
			? (pipeline.statusByNodeId[props.mermaidNodeId] ?? 'pending')
			: 'pending'
		const isOnlySelected = shape.id === editor.getOnlySelectedShapeId()

		return shapeView(FlowchartShapeView, {
			shapeId: id,
			type,
			w: props.w,
			h: props.h,
			status,
			pipelineStepIndex: props.pipelineStepIndex,
			mermaidNodeId: props.mermaidNodeId,
			fontFamily: `var(--tl-font-${props.font})`,
			fontSize:
				(LABEL_FONT_SIZES[props.size as TLDefaultSizeStyle] ?? LABEL_FONT_SIZES.m) * theme.fontSize,
			lineHeight: theme.lineHeight,
			textAlign: props.align === 'middle' ? 'center' : (props.align as 'start' | 'end'),
			verticalAlign: props.verticalAlign as 'start' | 'middle' | 'end',
			richText: props.richText,
			isSelected: isOnlySelected,
			labelColor: getColorValue(colors, props.color as TLDefaultColorStyle, 'solid'),
		})
	}

	override getIndicatorPath(shape: ICustomShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
