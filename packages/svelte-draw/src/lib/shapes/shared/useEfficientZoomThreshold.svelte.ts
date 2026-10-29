import { fromComputed, getEditor } from '@svelte-draw/svelte'

type MaybeGetter<T> = T | (() => T)

/**
 * Whether the editor is zoomed out far enough that shapes should render in a simplified "solid"
 * style. Call during component initialisation and read `.current`. `threshold` may be a getter to
 * follow a reactive prop. Replaces the React `useEfficientZoomThreshold` hook.
 */
export function useEfficientZoomThreshold(threshold: MaybeGetter<number> = 0.25): {
	readonly current: boolean
} {
	const editor = getEditor()
	const signal = $derived.by(() => {
		const t = typeof threshold === 'function' ? threshold() : threshold
		return fromComputed('efficient zoom threshold', () => editor.getEfficientZoomLevel() < t)
	})
	return {
		get current() {
			return signal.current
		},
	}
}
