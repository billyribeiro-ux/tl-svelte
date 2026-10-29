import {
	Geometry2d,
	Rectangle2d,
	ShapeUtil,
	T,
	createShapeId,
	resizeBox,
	shapeView,
	type Editor,
	type RecordProps,
	type TLResizeInfo,
	type TLShape,
} from 'svelte-draw'
import { MAP_HEIGHT, MAP_WIDTH, STATE_COLORS, getUsStatesData } from './us-map-data'
import UsMapShapeView from './UsMapShapeView.svelte'

const US_MAP_TYPE = 'us-map' as const

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[US_MAP_TYPE]: { w: number; h: number }
	}
}

export type UsMapShape = TLShape<typeof US_MAP_TYPE>

const statesData = getUsStatesData()

// [1]
export function explodeMap(editor: Editor, shape: UsMapShape) {
	const bounds = editor.getShapePageBounds(shape)
	if (!bounds) return

	const scaleX = bounds.w / MAP_WIDTH
	const scaleY = bounds.h / MAP_HEIGHT

	editor.run(
		() => {
			const newShapes = statesData.map((state, i) => ({
				id: createShapeId(),
				type: 'us-state' as const,
				x: bounds.x + state.bounds.x * scaleX,
				y: bounds.y + state.bounds.y * scaleY,
				props: {
					w: state.bounds.w * scaleX,
					h: state.bounds.h * scaleY,
					name: state.name,
					pathData: state.pathData,
					fill: STATE_COLORS[i % STATE_COLORS.length],
					originalW: state.bounds.w,
					originalH: state.bounds.h,
					pathOffsetX: state.bounds.x,
					pathOffsetY: state.bounds.y,
				},
			}))

			editor.deleteShape(shape.id)
			editor.createShapes(newShapes)
		},
		{ history: 'record-preserveRedoStack' }
	)
}

export class UsMapShapeUtil extends ShapeUtil<UsMapShape> {
	static override type = US_MAP_TYPE
	static override props: RecordProps<UsMapShape> = {
		w: T.number,
		h: T.number,
	}

	getDefaultProps(): UsMapShape['props'] {
		return { w: MAP_WIDTH, h: MAP_HEIGHT }
	}

	override canResize() {
		return true
	}
	override isAspectRatioLocked() {
		return true
	}

	getGeometry(shape: UsMapShape): Geometry2d {
		return new Rectangle2d({
			width: shape.props.w,
			height: shape.props.h,
			isFilled: true,
		})
	}

	override onResize(shape: UsMapShape, info: TLResizeInfo<UsMapShape>) {
		return resizeBox(shape, info)
	}

	override onDoubleClick(shape: UsMapShape) {
		explodeMap(this.editor, shape)
	}

	component(shape: UsMapShape) {
		return shapeView(UsMapShapeView, {
			w: shape.props.w,
			h: shape.props.h,
			states: statesData.map((state, i) => ({
				id: state.id,
				pathData: state.pathData,
				fill: STATE_COLORS[i % STATE_COLORS.length],
			})),
			onExplode: () => explodeMap(this.editor, shape),
		})
	}

	getIndicatorPath(shape: UsMapShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}

/*
[1]
Exploding deletes the map and creates all the state shapes inside one `editor.run` call,
so the whole operation is a single undo step. The state shapes are positioned from the
map's current page bounds so a resized map explodes at the same scale.
*/
