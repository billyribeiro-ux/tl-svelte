import { BaseBoxShapeUtil, type RecordProps, T, type TLShape, shapeView } from 'svelte-draw'
import PopupShape from './PopupShape.svelte'

// There's a guide at the bottom of this file!

export const MY_POPUP_SHAPE_TYPE = 'my-popup-shape'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[MY_POPUP_SHAPE_TYPE]: { w: number; h: number }
	}
}

export type IMyPopupShape = TLShape<typeof MY_POPUP_SHAPE_TYPE>

export class PopupShapeUtil extends BaseBoxShapeUtil<IMyPopupShape> {
	static override type = MY_POPUP_SHAPE_TYPE
	static override props: RecordProps<IMyPopupShape> = {
		w: T.number,
		h: T.number,
	}

	getDefaultProps(): IMyPopupShape['props'] {
		return {
			w: 200,
			h: 200,
		}
	}

	component(shape: IMyPopupShape) {
		// [2]
		const vpb = this.editor.getViewportPageBounds()
		const spb = this.editor.getShapePageBounds(shape)!
		const px = vpb.midX - spb.midX + spb.w / 2
		const py = vpb.midY - spb.midY + spb.h / 2

		return shapeView(PopupShape, {
			perspective: Math.max(vpb.w, vpb.h),
			perspectiveOriginX: px,
			perspectiveOriginY: py,
		})
	}

	getIndicatorPath(shape: IMyPopupShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

/*
[1]
Whether the card is standing up or lying flat is purely visual, so it lives in component state
(PopupShape.svelte) rather than in the shape's props. Double-clicking toggles it; the CSS transition animates it.

[2]
The 3D effect comes from CSS `perspective`. To make every card appear lit from the same
vantage point, the perspective origin is the viewport's center expressed in this shape's local
coordinates. A shape's `component` renders inside a reactive tracking scope, so reading the
viewport bounds here re-renders the shape as the camera moves and the vanishing point stays put.

[3]
The shape opts in to pointer events so it can receive the double click. Marking the events as
handled keeps the editor from treating them as a canvas click (which would select the shape or
start editing it).
*/
