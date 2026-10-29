import { BaseBoxShapeUtil, type TLShape, shapeView } from 'svelte-draw'
import AgGridShapeComponent from './AgGridShape.svelte'

export const AG_GRID_TYPE = 'ag-grid'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		// oxlint-disable-next-line typescript/no-explicit-any
		[AG_GRID_TYPE]: { w: number; h: number; rowData: any[]; columnDefs: any[] }
	}
}

type AgGridShape = TLShape<typeof AG_GRID_TYPE>

export class AgGridShapeUtil extends BaseBoxShapeUtil<AgGridShape> {
	static override type = AG_GRID_TYPE

	// [1]
	override canScroll(): boolean {
		return true
	}

	override canEdit(): boolean {
		return true
	}

	override getDefaultProps() {
		return {
			w: 300,
			h: 200,
			rowData: [],
			columnDefs: [],
		}
	}

	override component(shape: AgGridShape) {
		// [2]
		const isEditing = this.editor.getEditingShapeId() === shape.id

		return shapeView(AgGridShapeComponent, {
			w: shape.props.w,
			h: shape.props.h,
			isEditing,
			rowData: shape.props.rowData,
			columnDefs: shape.props.columnDefs,
		})
	}

	override getIndicatorPath(shape: AgGridShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
