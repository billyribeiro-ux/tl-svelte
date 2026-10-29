import { Rectangle2d, ShapeUtil, T, shapeView, type RecordProps, type TLShape } from 'svelte-draw'
import ExamMarkView from './ExamMarkView.svelte'

export const EXAM_MARK_WIDTH = 80
export const EXAM_MARK_HEIGHT = 40

const EXAM_MARK_TYPE = 'exam-mark'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[EXAM_MARK_TYPE]: {
			score: number
		}
	}
}

export type IExamMarkShape = TLShape<typeof EXAM_MARK_TYPE>

export const examMarkShapeDefaultProps: IExamMarkShape['props'] = {
	score: 0,
}

export class ExamMarkUtil extends ShapeUtil<IExamMarkShape> {
	static override type = EXAM_MARK_TYPE
	static override props: RecordProps<IExamMarkShape> = {
		score: T.number,
	}

	override getDefaultProps(): IExamMarkShape['props'] {
		return examMarkShapeDefaultProps
	}

	// [1]
	override canEdit(): boolean {
		return true
	}

	// [2]
	override component(shape: IExamMarkShape) {
		// [a]
		// `InnerShape` runs `component()` under signal tracking, so this keeps the view current.
		const isEditing = this.editor.getEditingShapeId() === shape.id

		return shapeView(ExamMarkView, {
			shapeId: shape.id,
			score: shape.props.score,
			isEditing,
		})
	}

	override getIndicatorPath() {
		const path = new Path2D()
		path.rect(0, 0, EXAM_MARK_WIDTH, EXAM_MARK_HEIGHT)
		return path
	}

	getGeometry() {
		return new Rectangle2d({
			width: EXAM_MARK_WIDTH,
			height: EXAM_MARK_HEIGHT,
			isFilled: true,
		})
	}

	override hideSelectionBoundsBg() {
		return true
	}
	override hideSelectionBoundsFg() {
		return true
	}

	override canResize(): boolean {
		return false
	}
}

/*
See the custom-config example for the basics of a shape util. The notes below cover only
what is specific to this shape; the component itself is `ExamMarkView.svelte`.

[1]
Making the shape editable means double-clicking it enters editing mode, which we read back
via `editor.getEditingShapeId()` and use to enable and focus the input.

[2]
The component is a plain `HTMLContainer` wrapping a number input.

 - [a] The input only receives pointer events while the shape is being edited, so a
   single click still selects and drags the shape.

 - [b] Local state holds the raw text of the input (which may be empty or "-" mid-edit);
   only valid numbers are written back to the shape's `score` prop.

 - [c] Newly created marks start in editing mode so the input is ready to type into.

 - [d] Focus and select the input whenever editing starts, whether from creation or a
   double-click.

 - [e] `editor.updateShape` writes the score into the store, which is what makes the total
   in `ExamScoreLabel` update.
*/
