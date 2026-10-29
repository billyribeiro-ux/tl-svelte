import type { ReadonlySharedStyleMap, StyleProp } from '@svelte-draw/editor'
import { defineUiContext } from '../../context/uiContext'

/**
 * What the style panel's pickers read. `styles` and `enhancedA11yMode` are getters on the object a
 * {@link StylePanelContextProvider} sets, so read them inside `$derived` or the template to follow
 * changes (destructuring takes a snapshot).
 *
 * @public
 */
export interface StylePanelContext {
	readonly styles: ReadonlySharedStyleMap
	readonly enhancedA11yMode: boolean
	onHistoryMark(id: string): void
	onValueChange<T>(style: StyleProp<T>, value: T): void
	onOpacityChange(opacity: number): void
}

const stylePanelContext = defineUiContext<StylePanelContext>('svelte-draw.ui.stylePanel')

/** @internal */
export function setStylePanelContext(value: StylePanelContext): void {
	stylePanelContext.set(value)
}

/**
 * Replaces `useStylePanelContext`. Call during component initialisation. Throws outside a
 * `StylePanelContextProvider`.
 *
 * @public
 */
export function getStylePanelContext(): StylePanelContext {
	return stylePanelContext.get(
		'getStylePanelContext must be used within a StylePanelContextProvider'
	)
}
