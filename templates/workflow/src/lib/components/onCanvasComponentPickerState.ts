import type { TLShapeId, VecModel } from 'svelte-draw'
import type { NodeType } from '../nodes/nodeTypes'
import { EditorAtom } from '../utils'

export interface OnCanvasComponentPickerState {
	connectionShapeId: TLShapeId
	location: 'start' | 'end' | 'middle'
	onPick: (nodeType: NodeType, position: VecModel) => void
	onClose: () => void
}

export const onCanvasComponentPickerState = new EditorAtom<OnCanvasComponentPickerState | null>(
	'on canvas component picker',
	() => null
)
