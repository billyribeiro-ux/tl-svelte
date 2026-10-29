import type { TLShape } from 'svelte-draw'

export const SOFT_CLIP_META_KEY = 'softClip'

export function isSoftClipShape(shape: TLShape) {
	return shape.type === 'geo' && shape.meta?.[SOFT_CLIP_META_KEY] === true
}
