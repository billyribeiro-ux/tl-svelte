import { fromComputed, type SignalValue } from 'svelte-draw'

/**
 * A signal-backed value that also follows Svelte reactive inputs (props, `$state`).
 *
 * `fromComputed` only tracks `@svelte-draw/state` signals: a prop read inside its callback would
 * go stale, which is what `useValue(name, fn, [deps])` handled by recreating the computed when a
 * dependency changed. Here `args` is read eagerly inside a `$derived`, so a change to any Svelte
 * input recreates the computed, and the computed itself still follows editor signals.
 *
 * Call during component initialisation.
 */
export function fromComputedWith<A, T>(
	name: string,
	args: () => A,
	fn: (args: A) => T
): SignalValue<T> {
	const holder = $derived.by(() => {
		const a = args()
		return fromComputed(name, () => fn(a))
	})
	return {
		get current() {
			return holder.current
		},
	}
}
