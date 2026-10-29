import { defineUiContext } from '../../context/uiContext'

/**
 * `true` inside the toolbar's overflow popover. Replaces React's `IsInOverflowContext`; read it
 * with {@link getIsInOverflow}, which is `false` outside the overflow.
 */
const isInOverflowContext = defineUiContext<boolean>('svelte-draw.ui.toolbar-overflow')

export const setIsInOverflow = isInOverflowContext.set

/** @public */
export function getIsInOverflow(): boolean {
	return isInOverflowContext.tryGet() ?? false
}
