import { computed, react, type Signal } from '@svelte-draw/state'
import { createSubscriber } from 'svelte/reactivity'

/** A read-only reactive view of a `@svelte-draw/state` signal for use in Svelte 5 components. */
export interface SignalValue<T> {
	readonly current: T
}

/**
 * Bridges a `@svelte-draw/state` signal into Svelte's reactivity. Reading `.current` inside a
 * `$derived`, `$effect` or the template subscribes that scope to the signal; reading it anywhere
 * else just returns the latest value without subscribing.
 */
export function fromSignal<T>(signal: Signal<T>): SignalValue<T> {
	const subscribe = createSubscriber((update) => {
		let isFirstRun = true
		return react(`fromSignal(${signal.name})`, () => {
			try {
				signal.get()
			} catch {
				// The error is rethrown by `.current` if the reader is still alive.
			}
			// `react` runs once on attach; that run only captures dependencies.
			if (isFirstRun) {
				isFirstRun = false
				return
			}
			update()
		})
	})

	return {
		get current() {
			subscribe()
			return signal.__unsafe__getWithoutCapture()
		},
	}
}

/**
 * Like {@link fromSignal}, but derives the value from `fn`, which may read any number of signals.
 * The result is memoized, so readers only re-run when the computed value actually changes.
 */
export function fromComputed<T>(name: string, fn: () => T): SignalValue<T> {
	return fromSignal(computed(name, fn))
}
