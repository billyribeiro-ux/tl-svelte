import { areArraysShallowEqual, areObjectsShallowEqual, isEqual } from '@svelte-draw/utils'

/** A read-only value whose identity only changes when `isEqual` says the new value differs. */
export interface StableValue<T> {
	readonly current: T
}

/**
 * Returns a view of `get()` that keeps handing out the previous value for as long as `isEqual`
 * considers the new one equal. Reading `.current` in a `$derived` or `$effect` therefore only
 * re-runs that scope when the value really changed, which replaces the React `useIdentity` hooks.
 */
export function stableValue<T>(get: () => T, isEqualFn: (a: T, b: T) => boolean): StableValue<T> {
	let previous: { value: T } | null = null
	const stable = $derived.by(() => {
		const next = get()
		if (previous && isEqualFn(next, previous.value)) return previous.value
		previous = { value: next }
		return next
	})
	return {
		get current() {
			return stable
		},
	}
}

const areNullableArraysShallowEqual = (
	a: readonly any[] | null | undefined,
	b: readonly any[] | null | undefined
) => {
	a ??= null
	b ??= null
	if (a === b) return true
	if (!a || !b) return false
	return areArraysShallowEqual(a, b)
}

const areNullableObjectsShallowEqual = (
	a: object | null | undefined,
	b: object | null | undefined
) => {
	a ??= null
	b ??= null
	if (a === b) return true
	if (!a || !b) return false
	return areObjectsShallowEqual(a, b)
}

/** @internal */
export function shallowArrayIdentity<T extends readonly any[] | null | undefined>(
	get: () => T
): StableValue<T> {
	return stableValue(get, areNullableArraysShallowEqual)
}

/** @internal */
export function shallowObjectIdentity<T extends object | null | undefined>(
	get: () => T
): StableValue<T> {
	return stableValue(get, areNullableObjectsShallowEqual)
}

/**
 * For small option objects that may nest (e.g. camera constraints), where a shallow comparison
 * would still see a fresh identity on every render. Functions and class instances inside still
 * compare by reference, so an inline callback or a fresh `Extension.configure()` counts as a change.
 *
 * @internal
 */
export function deepObjectIdentity<T extends object | null | undefined>(
	get: () => T
): StableValue<T> {
	return stableValue(get, isEqual)
}
