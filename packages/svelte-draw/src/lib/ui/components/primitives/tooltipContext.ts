import { getContext, setContext } from 'svelte'

const TOOLTIP_SINGLETON_KEY = Symbol('svelte-draw.ui.tooltip-singleton')

/** Marks the subtree as being inside a `SvelteDrawUiTooltipProvider` (the shared-tooltip mode). */
export function setHasTooltipProvider(): void {
	setContext(TOOLTIP_SINGLETON_KEY, true)
}

/** Whether a `SvelteDrawUiTooltipProvider` is an ancestor. */
export function getHasTooltipProvider(): boolean {
	return getContext<boolean | undefined>(TOOLTIP_SINGLETON_KEY) ?? false
}
