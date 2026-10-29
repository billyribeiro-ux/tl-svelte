import {
	BaseBoxShapeUtil,
	type RecordProps,
	T,
	type TLShape,
	type TLShapePartial,
	shapeView,
} from 'svelte-draw'
import ClickableShapeComponent from './ClickableShape.svelte'

// There's a guide at the bottom of this file!

export const CLICKABLE_SHAPE_TYPE = 'clickable'

// [1]
declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[CLICKABLE_SHAPE_TYPE]: { w: number; h: number; count: number }
	}
}

type ClickableShape = TLShape<typeof CLICKABLE_SHAPE_TYPE>

// [2]
export class ClickableShapeUtil extends BaseBoxShapeUtil<ClickableShape> {
	static override type = CLICKABLE_SHAPE_TYPE
	static override props: RecordProps<ClickableShape> = {
		w: T.number,
		h: T.number,
		count: T.number,
	}

	getDefaultProps(): ClickableShape['props'] {
		return {
			w: 200,
			h: 100,
			count: 0,
		}
	}

	// [3]
	override onClick(shape: ClickableShape): TLShapePartial<ClickableShape> | void {
		return {
			id: shape.id,
			type: shape.type,
			props: {
				count: shape.props.count + 1,
			},
		}
	}

	// [4]
	component(shape: ClickableShape) {
		return shapeView(ClickableShapeComponent, { count: shape.props.count })
	}

	// [5]
	getIndicatorPath(shape: ClickableShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

/*
This example shows how to use ShapeUtil.onClick to handle clicks on a custom shape.

[1]
Extend TLGlobalShapePropsMap to register the shape's props. We include a `count` prop
that tracks how many times the shape has been clicked.

[2]
Our shape util class. We extend BaseBoxShapeUtil which provides getGeometry (a filled
rectangle from w/h), onResize, and snap geometry for free.

[3]
The onClick handler is the key part of the example. The select tool calls it on pointer
up when the user clicks the shape without dragging. If it returns a shape partial, the
editor applies it and skips selecting the shape; return nothing to fall through to the
normal selection behavior.

This is different from an onclick handler on a DOM element inside the component: those
elements sit under the editor's pointer handling (HTMLContainer has pointer-events: none),
so a DOM handler would also need pointer-events: all and would fight with dragging.
ShapeUtil.onClick goes through the editor's event system, so click and drag coexist.

[4]
The component renders the click count. There are no DOM event handlers here; the click
handling is done entirely through ShapeUtil.onClick above.

[5]
getIndicatorPath returns a Path2D that svelte-draw strokes onto the canvas overlay as the
blue outline when the shape is selected.
*/
