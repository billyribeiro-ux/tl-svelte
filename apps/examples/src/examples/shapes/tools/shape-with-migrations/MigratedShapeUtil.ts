import {
	BaseBoxShapeUtil,
	T,
	type TLResizeInfo,
	type TLShape,
	createShapePropsMigrationIds,
	createShapePropsMigrationSequence,
	resizeBox,
	shapeView,
} from 'svelte-draw'
import MigratedShape from './MigratedShape.svelte'

export const MY_SHAPE_WITH_MIGRATIONS_TYPE = 'myshapewithmigrations' as const

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[MY_SHAPE_WITH_MIGRATIONS_TYPE]: { w: number; h: number; color: string }
	}
}

// There's a guide at the bottom of this file!

export type IMyShape = TLShape<typeof MY_SHAPE_WITH_MIGRATIONS_TYPE>

// [1]
const versions = createShapePropsMigrationIds(
	// this must match the shape type in the shape definition
	MY_SHAPE_WITH_MIGRATIONS_TYPE,
	{
		AddColor: 1,
	}
)

// [2]
export const myShapeMigrations = createShapePropsMigrationSequence({
	sequence: [
		{
			id: versions.AddColor,
			up(props) {
				// props is a mutable copy, so it's safe to change it in place
				props.color = 'lightblue'
			},
			down(props) {
				delete props.color
			},
		},
	],
})

export class MigratedShapeUtil extends BaseBoxShapeUtil<IMyShape> {
	static override type = MY_SHAPE_WITH_MIGRATIONS_TYPE

	static override props = {
		w: T.number,
		h: T.number,
		color: T.string,
	}

	// [3]
	static override migrations = myShapeMigrations

	getDefaultProps(): IMyShape['props'] {
		return {
			w: 300,
			h: 300,
			color: 'lightblue',
		}
	}

	component(shape: IMyShape) {
		return shapeView(MigratedShape, { id: shape.id, color: shape.props.color })
	}

	getIndicatorPath(shape: IMyShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}

	override onResize(shape: IMyShape, info: TLResizeInfo<IMyShape>) {
		return resizeBox(shape, info)
	}
}

// The guide for this example is at the bottom of ShapeWithMigrationsExample.svelte.
