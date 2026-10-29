import { getContext, setContext } from 'svelte'

/** @public */
export interface SvelteDrawUiOrientationContext {
	readonly orientation: 'horizontal' | 'vertical'
	readonly tooltipSide: 'top' | 'right' | 'bottom' | 'left'
}

const ORIENTATION_KEY = Symbol('svelte-draw.ui.orientation')

const DEFAULT_ORIENTATION: SvelteDrawUiOrientationContext = {
	orientation: 'horizontal',
	tooltipSide: 'bottom',
}

/**
 * Replaces `useSvelteDrawUiOrientation`. Returns the orientation / tooltip side of the nearest layout
 * ancestor (`horizontal` / `bottom` when there is none). The returned object has getters, so read its
 * properties inside `$derived`, the template or an effect to stay reactive.
 *
 * @public
 */
export function getSvelteDrawUiOrientation(): SvelteDrawUiOrientationContext {
	return getContext<SvelteDrawUiOrientationContext | undefined>(ORIENTATION_KEY) ?? DEFAULT_ORIENTATION
}

/**
 * Provides the orientation context to descendants. Call during component initialisation. The values
 * are passed as getters so they can follow reactive props. Replaces `SvelteDrawUiOrientationProvider`'s
 * context value (the `<SvelteDrawUiOrientationProvider>` component wraps this).
 *
 * @public
 */
export function setSvelteDrawUiOrientation(
	getOrientation: () => 'horizontal' | 'vertical',
	getTooltipSide: () => 'top' | 'right' | 'bottom' | 'left' | undefined
): void {
	const prevContext = getSvelteDrawUiOrientation()
	setContext<SvelteDrawUiOrientationContext>(ORIENTATION_KEY, {
		get orientation() {
			return getOrientation()
		},
		get tooltipSide() {
			// generally, we want tooltip side to cascade down through the layout - apart from when the
			// orientation changes. If the tooltip side is "bottom", and then I include some vertical layout
			// elements, keeping the tooltip side as bottom will cause the tooltip to overlap elements
			// stacked on top of each other. In the absence of a tooltip side, we pick a default side based
			// on the orientation whenever the orientation changes.
			const orientation = getOrientation()
			return (
				getTooltipSide() ??
				(orientation === prevContext.orientation
					? prevContext.tooltipSide
					: orientation === 'horizontal'
						? 'bottom'
						: 'right')
			)
		},
	})
}
