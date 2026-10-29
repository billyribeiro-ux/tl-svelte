import { BaseBoxShapeUtil, shapeView, T, type RecordProps, type TLShape } from 'svelte-draw'
import GlowShapeComponent from './GlowShape.svelte'

export const GLOW_SHAPE_TYPE = 'glow-shape'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[GLOW_SHAPE_TYPE]: { w: number; h: number; preventCulling: boolean }
	}
}

type GlowShape = TLShape<typeof GLOW_SHAPE_TYPE>

export class GlowShapeUtil extends BaseBoxShapeUtil<GlowShape> {
	static override type = GLOW_SHAPE_TYPE
	static override props: RecordProps<GlowShape> = {
		w: T.number,
		h: T.number,
		preventCulling: T.boolean,
	}

	getDefaultProps(): GlowShape['props'] {
		return {
			w: 150,
			h: 100,
			preventCulling: false,
		}
	}

	// [1]
	override canCull(shape: GlowShape) {
		return !shape.props.preventCulling
	}

	// [2]
	component(shape: GlowShape) {
		return shapeView(GlowShapeComponent, {
			id: shape.id,
			preventCulling: shape.props.preventCulling,
		})
	}

	getIndicatorPath(shape: GlowShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

/*
[1]
`canCull()` is called per shape, so the decision can depend on the shape's own props (or any
other state). Here a checkbox on the shape flips it.

[2]
Both shapes render the same glow; only the checkbox differs. Stopping pointer-down propagation
(see GlowShape.svelte) lets the checkbox receive the click instead of the select tool starting
a drag.
*/
