import type { VecLike } from '@svelte-draw/editor'
import type { Attachment } from 'svelte/attachments'

/**
 * Position an element by writing its `transform` directly, outside the template's output: the cheap
 * path for elements that move at pointer/presence frequency. Replaces `useTransform`.
 *
 * Use as `{@attach transform(x, y, scale)}`. The attachment re-runs whenever the arguments change
 * (they are evaluated inside the attachment's effect). Does nothing while `x` is undefined.
 *
 * @public
 */
export function transform(
	x?: number,
	y?: number,
	scale?: number,
	rotate?: number,
	additionalOffset?: VecLike
): Attachment<HTMLElement | SVGElement> {
	// Read the offset into primitives so the attachment depends on them, not the object identity.
	const additionalOffsetX = additionalOffset?.x
	const additionalOffsetY = additionalOffset?.y

	return (elm) => {
		if (x === undefined) return

		let trans = `translate(${x}px, ${y}px)`
		if (scale !== undefined) {
			trans += ` scale(${scale})`
		}
		if (rotate !== undefined) {
			trans += ` rotate(${rotate}rad)`
		}
		if (additionalOffsetX !== undefined && additionalOffsetY !== undefined) {
			trans += ` translate(${additionalOffsetX}px, ${additionalOffsetY}px)`
		}
		elm.style.transform = trans
	}
}
