import { fromComputed, type SignalValue } from '@svelte-draw/svelte'

/**
 * Reads editor signals (via `fn`) as reactive state, re-creating the underlying computed whenever
 * the Svelte props it depends on change. React's `track()` / `useValue()` did both at once; in
 * Svelte, props must be read OUTSIDE of the signal computed (`getArgs`, tracked by Svelte), while
 * editor signals are read INSIDE it (`fn`, tracked by `@svelte-draw/state`). Call during component
 * initialisation and read `.current`.
 */
export function reactiveComputed<Args, T>(
	name: string,
	getArgs: () => Args,
	fn: (args: Args) => T
): SignalValue<T> {
	const signal = $derived.by(() => {
		const args = getArgs()
		return fromComputed(name, () => fn(args))
	})
	return {
		get current() {
			return signal.current
		},
	}
}
