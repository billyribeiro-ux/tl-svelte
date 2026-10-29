import { BaseBoxShapeUtil, type RecordProps, T, type TLShape, shapeView } from 'svelte-draw'
import DropZone from './DropZone.svelte'

// There's a guide at the bottom of this file!

export const DROP_ZONE_SHAPE_TYPE = 'drop-zone'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[DROP_ZONE_SHAPE_TYPE]: { w: number; h: number }
	}
}

export type IDropZoneShape = TLShape<typeof DROP_ZONE_SHAPE_TYPE>

export class DropZoneShapeUtil extends BaseBoxShapeUtil<IDropZoneShape> {
	static override type = DROP_ZONE_SHAPE_TYPE
	static override props: RecordProps<IDropZoneShape> = {
		w: T.number,
		h: T.number,
	}

	getDefaultProps(): IDropZoneShape['props'] {
		return { w: 300, h: 300 }
	}

	component(shape: IDropZoneShape) {
		return shapeView(DropZone, { w: shape.props.w, h: shape.props.h })
	}

	getIndicatorPath(shape: IDropZoneShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

/*
This is a custom shape, for a more in-depth look at how to create a custom shape,
see our custom shape example.

[1]
The dropped image lives in component state only (DropZone.svelte), so it isn't persisted or synced and
disappears if the shape remounts. A real app would upload the file and store a URL in the
shape's props instead.

[2]
The shape's container has `pointer-events: all` (see drop-zone-shape.css) so it receives
drag events at all. The browser only fires `drop` on an element whose `dragover` called
`preventDefault`, and `stopPropagation` keeps the canvas from also handling the file and
creating an image shape from it.

[3]
Only the first image file is used; anything else dropped on the shape is ignored.
*/
