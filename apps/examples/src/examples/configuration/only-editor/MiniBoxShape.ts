import { BaseBoxShapeUtil, type TLShape, shapeView } from 'svelte-draw'
import MiniBoxView from './MiniBoxView.svelte'

// There's a guide at the bottom of this file!

const BOX_TYPE = 'box'

// [1]
declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[BOX_TYPE]: { w: number; h: number; color: string }
	}
}

// [2]
export type MiniBoxShape = TLShape<typeof BOX_TYPE>

// [3]
export class MiniBoxShapeUtil extends BaseBoxShapeUtil<MiniBoxShape> {
	static override type = BOX_TYPE
	override getDefaultProps(): MiniBoxShape['props'] {
		return { w: 100, h: 100, color: '#efefef' }
	}
	// [a]
	component(shape: MiniBoxShape) {
		return shapeView(MiniBoxView, {
			w: shape.props.w,
			h: shape.props.h,
			color: shape.props.color,
		})
	}
	// [b]
	getIndicatorPath(shape: MiniBoxShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

/*
[1]
Registering the props in TLGlobalShapePropsMap is what makes `editor.createShapes({ type: 'box' })`
type-check and gives `TLShape<'box'>` its props type.

[2]
The shape's record type, derived from the registration above.

[3]
BaseBoxShapeUtil supplies rectangular geometry and resize behavior for any shape with `w` and `h`
props, so this util only needs to say what the box looks like.
	[a] HTMLContainer (in MiniBoxView.svelte) positions the shape's DOM on the canvas.
		`pointer-events: all` is what lets the select tool receive events with this shape as the
		target.
	[b] The indicator is the outline drawn when the shape is selected or hovered, as a Path2D in
		shape space.
*/
