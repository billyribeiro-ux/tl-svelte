import { fromComputed } from '@svelte-draw/svelte'
import {
	debugFlags,
	measureCbDuration,
	type TLUiEventSource,
	type TLUiOverrides,
} from 'svelte-draw'

/**
 * Replaces the `usePerformance` hook. Call during component initialisation; read `.current`
 * for the overrides, which switch on when the `measurePerformance` debug flag is on.
 */
export function usePerformance(): { readonly current: TLUiOverrides } {
	const measurePerformance = fromComputed('measurePerformance', () =>
		debugFlags.measurePerformance.get()
	)
	const none: TLUiOverrides = {}
	const overrides: TLUiOverrides = {
		actions(_editor, actions) {
			Object.keys(actions).forEach((key) => {
				const action = actions[key]
				const cb = action.onSelect
				action.onSelect = (source: TLUiEventSource) => {
					return measureCbDuration(`Action ${key}`, () => cb(source))
				}
			})

			return actions
		},
	}
	return {
		get current() {
			return measurePerformance.current ? overrides : none
		},
	}
}
