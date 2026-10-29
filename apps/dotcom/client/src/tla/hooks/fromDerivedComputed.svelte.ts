import { fromComputed } from 'svelte-draw'

/**
 * `fromComputed` for a computation that also depends on Svelte-reactive values (props, `$state`),
 * which a signals `computed` cannot see: it memoises until one of *its* signals changes, so a
 * changed prop would be served the stale result. `deps` is read inside a `$derived`, so when it
 * changes a fresh computed is created for the new inputs. Replaces `useValue(name, fn, [deps])`.
 * Call during component initialisation.
 */
export function fromDerivedComputed<D, T>(
	name: string,
	deps: () => D,
	fn: (deps: D) => T
): { readonly current: T } {
	const holder = $derived.by(() => {
		const d = deps()
		return fromComputed(name, () => fn(d))
	})
	return {
		get current() {
			return holder.current
		},
	}
}
