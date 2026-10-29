import { PORTRAIT_BREAKPOINT, PORTRAIT_BREAKPOINTS } from '../constants'
import { defineUiContext } from './uiContext'

/** @public */
export interface BreakPointProviderProps {
	forceMobile?: boolean
	children: import('svelte').Snippet
}

const breakpointContext = defineUiContext<{ readonly current: number }>('svelte-draw.ui.breakpoint')

/** @internal */
export function setBreakpoint(holder: { readonly current: number }): void {
	breakpointContext.set(holder)
}

/**
 * Pure breakpoint lookup, extracted from the React provider's `useValue` body.
 *
 * @internal
 */
export function computeBreakpoint(width: number, forceMobile: boolean): number {
	const maxBreakpoint = forceMobile ? PORTRAIT_BREAKPOINT.MOBILE_SM : PORTRAIT_BREAKPOINTS.length - 1

	for (let i = 0; i < maxBreakpoint; i++) {
		if (width > PORTRAIT_BREAKPOINTS[i] && width <= PORTRAIT_BREAKPOINTS[i + 1]) {
			return i
		}
	}

	return maxBreakpoint
}

/**
 * Replaces `useBreakpoint`. Returns a reactive `{ current }` holder (the breakpoint index); read
 * `.current` inside `$derived`, an `$effect` or the template. Throws outside a provider.
 *
 * @public
 */
export function getBreakpoint(): { readonly current: number } {
	return breakpointContext.get(
		'getBreakpoint must be used inside of the <BreakPointProvider /> component'
	)
}
