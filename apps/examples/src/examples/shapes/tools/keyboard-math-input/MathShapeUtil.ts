import { type RecordProps, Rectangle2d, ShapeUtil, T, type TLShape, shapeView } from 'svelte-draw'
import MathShape from './MathShape.svelte'

// There's a guide at the bottom of this file!

export const MATH_SHAPE_TYPE = 'math'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[MATH_SHAPE_TYPE]: {
			w: number
			h: number
			text: string
		}
	}
}

export type IMathShape = TLShape<typeof MATH_SHAPE_TYPE>

export const MIN_W = 40
export const MIN_H = 36

export class MathShapeUtil extends ShapeUtil<IMathShape> {
	static override type = MATH_SHAPE_TYPE
	static override props: RecordProps<IMathShape> = {
		w: T.number,
		h: T.number,
		text: T.string,
	}

	getDefaultProps(): IMathShape['props'] {
		return { w: MIN_W, h: MIN_H, text: '' }
	}

	// [2]
	override canEdit() {
		return true
	}

	// [3]
	override canResize() {
		return false
	}

	// [4]
	override onEditEnd(shape: IMathShape) {
		if (!shape.props.text.trim()) {
			this.editor.deleteShape(shape.id)
		}
	}

	getGeometry(shape: IMathShape) {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	component(shape: IMathShape) {
		const isEditing = this.editor.getEditingShapeId() === shape.id
		return shapeView(MathShape, { id: shape.id, text: shape.props.text, isEditing })
	}

	getIndicatorPath(shape: IMathShape) {
		const p = new Path2D()
		p.rect(0, 0, shape.props.w, shape.props.h)
		return p
	}
}

/*
A text-like custom shape for math. It stores the shorthand exactly as typed,
translates it to LaTeX (see shorthand.ts), and renders it with KaTeX. Storing
the source rather than the LaTeX means re-editing shows what you typed.

[1]
(MathRendered.svelte) Display: translate the shorthand and render it with KaTeX. `throwOnError:
false` means partially-typed input still renders instead of throwing. KaTeX
escapes its input, so the innerHTML here is safe as long as the `trust`
option stays off (it is off by default).

[2]
Only shapes with `canEdit` can enter the editor's editing state (double-click,
or select + Enter). Like svelte-draw's own text shape, editing swaps the rendered
equation for a plain text input showing the shorthand source; the math
renders again when the edit ends (see MathInput.svelte).

[3]
The shape hugs its content, so manual resizing is disabled: `w` and `h` are
derived from measurement, not set by the user.

[4]
Like svelte-draw's own text shape, finishing an edit with nothing typed deletes the
shape rather than leaving an invisible empty one behind.

[5]
Auto-size (MathShape.svelte): a ResizeObserver measures the rendered content and writes the size
back into the shape's props, so the geometry and selection indicator always
fit the equation. offsetWidth/offsetHeight ignore CSS transforms, so the
measurement is independent of the camera zoom.

[6]
The shape's HTML container has pointer-events: none, and the property
inherits. Interactive content inside a shape must opt back in with
pointer-events: all. We only do so while editing, so clicking the rendered
equation still selects the shape normally.

[7]
Live preview: while editing, the rendered equation floats in a bubble above
the shape, updating on every keystroke. It's absolutely positioned, so it
doesn't affect the measured size of the shape, and styled as a card so it
reads as UI rather than a second copy of the text.
*/
