import { AtomMap, EditorAtom, type TLShape, type TLShapeId } from 'svelte-draw'

export const DYNAMIC_SIZE_TYPE = 'dynamic-size'

// [1]
declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[DYNAMIC_SIZE_TYPE]: { contents: string[] }
	}
}

// [2]
export type DynamicSizeShape = TLShape<typeof DYNAMIC_SIZE_TYPE>

export const SHAPE_WIDTH_PX = 150

// [3]
export const ShapeSizes = new EditorAtom('shape sizes', (editor) => {
	const map = new AtomMap<TLShapeId, { width: number; height: number }>('shape sizes')

	// [a] Clean up sizes when shapes are deleted
	editor.sideEffects.registerAfterDeleteHandler('shape', (shape) => {
		map.delete(shape.id)
	})

	return map
})
