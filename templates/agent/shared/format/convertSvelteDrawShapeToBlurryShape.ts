import type { Editor, TLShape } from 'svelte-draw'
import type { BlurryShape } from './BlurryShape'
import {
	convertSvelteDrawIdToSimpleId,
	convertSvelteDrawShapeToFocusedType,
} from './convertSvelteDrawShapeToFocusedShape'
import type { FocusedShape } from './FocusedShape'

/**
 * Convert a svelte-draw shape to the blurry shape format
 */
export function convertSvelteDrawShapeToBlurryShape(
	editor: Editor,
	shape: TLShape
): BlurryShape | null {
	const bounds = editor.getShapeMaskedPageBounds(shape)
	if (!bounds) return null

	const util = editor.getShapeUtil(shape)
	const text = util.getText(shape)

	const shapeType = convertSvelteDrawShapeToFocusedType(shape)

	return {
		x: Math.round(bounds.x),
		y: Math.round(bounds.y),
		w: Math.round(bounds.w),
		h: Math.round(bounds.h),
		type: shapeType as FocusedShape['_type'],
		shapeId: convertSvelteDrawIdToSimpleId(shape.id),
		text,
	}
}
