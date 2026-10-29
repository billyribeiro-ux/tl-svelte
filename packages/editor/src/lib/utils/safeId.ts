/**
 * The DOM requires that all IDs are unique. We often use e.g. shape IDs in the dom, but this isn't
 * safe: if svelte-draw is rendered twice, or an SVG export is taking place, the IDs will clash and the
 * browser will do weird things. This type is used to mark IDs that are unique and safe to use.
 *
 * @public
 */
export type SafeId = string & { __brand: 'SafeId' }

/** @public */
export function sanitizeId(id: string): string {
	return id.replace(/:/g, '_')
}

/** @public */
export function suffixSafeId(id: SafeId, suffix: string): SafeId {
	return sanitizeId(`${id}_${suffix}`) as SafeId
}
