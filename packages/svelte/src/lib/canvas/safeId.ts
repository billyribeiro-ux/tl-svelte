import { sanitizeId, suffixSafeId, type SafeId } from '@svelte-draw/editor'
import { getContext, hasContext, setContext } from 'svelte'

export { sanitizeId, suffixSafeId, type SafeId }

/**
 * The DOM requires that all IDs are unique. We often use e.g. shape IDs in the dom, but this isn't
 * safe: if svelte-draw is rendered twice, or an SVG export is taking place, the IDs will clash and
 * the browser will do weird things. {@link SafeId} marks IDs that are unique and safe to use.
 *
 * Use {@link createUniqueSafeId} for an ID that is unique per call, and {@link getSharedSafeId} for
 * the same ID across multiple components but unique per editor instance.
 */

let uniqueCounter = 0

/**
 * Replacement for React's `useUniqueSafeId`: a unique, CSS-selector-safe id (no colons). Unique per
 * call for the lifetime of the page. Call it during component initialisation.
 */
export function createUniqueSafeId(suffix?: string): SafeId {
	uniqueCounter++
	return sanitizeId(`tl_${uniqueCounter.toString(36)}${suffix ?? ''}`) as SafeId
}

const ID_SCOPE_KEY = Symbol('svelte-draw.id-scope')

/**
 * Replacement for `IdProvider`: starts an id scope for this editor instance. Call it once during
 * initialisation of the editor's root component. `DefaultCanvas` also calls it if no scope exists
 * yet, so a bare canvas works.
 */
export function setIdScope(): SafeId {
	const id = createUniqueSafeId()
	setContext(ID_SCOPE_KEY, id)
	return id
}

/** Whether an id scope has been started by an ancestor. */
export function hasIdScope(): boolean {
	return hasContext(ID_SCOPE_KEY)
}

/**
 * Replacement for `useSharedSafeId`: the same id for every component within one editor instance.
 * Throws when called outside of an id scope.
 */
export function getSharedSafeId(id: string): SafeId {
	const idScope = getContext<SafeId | undefined>(ID_SCOPE_KEY)
	if (!idScope) {
		throw new Error('getSharedSafeId must be used inside of an id scope (see setIdScope)')
	}
	return sanitizeId(`${idScope}_${id}`) as SafeId
}
