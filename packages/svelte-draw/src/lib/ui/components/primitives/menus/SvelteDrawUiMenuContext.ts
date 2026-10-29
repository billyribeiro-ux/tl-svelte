import { getContext, setContext } from 'svelte'
import type { TLUiEventSource } from '../../../context'

/** @public */
export type TLUiMenuContextType =
	| 'menu'
	| 'small-icons'
	| 'context-menu'
	| 'icons'
	| 'keyboard-shortcuts'
	| 'helper-buttons'
	| 'toolbar'
	| 'toolbar-overflow'

/** @public */
export interface SvelteDrawUiMenuContext {
	readonly type: TLUiMenuContextType
	readonly sourceId: TLUiEventSource
}

const MENU_CONTEXT_KEY = Symbol('svelte-draw.ui.menu-context')

/**
 * Replaces `useSvelteDrawUiMenuContext`. Throws outside of a `SvelteDrawUiMenuContextProvider`. The
 * returned object has getters, so read it inside `$derived` / the template to stay reactive.
 *
 * @public
 */
export function getSvelteDrawUiMenuContext(): SvelteDrawUiMenuContext {
	const context = getContext<SvelteDrawUiMenuContext | undefined>(MENU_CONTEXT_KEY)
	if (!context) {
		throw new Error(
			'getSvelteDrawUiMenuContext must be used within a SvelteDrawUiMenuContextProvider'
		)
	}
	return context
}

/** Sets the menu context for descendants. Call during component initialisation. */
export function setSvelteDrawUiMenuContext(
	getType: () => TLUiMenuContextType,
	getSourceId: () => TLUiEventSource
): void {
	setContext<SvelteDrawUiMenuContext>(MENU_CONTEXT_KEY, {
		get type() {
			return getType()
		},
		get sourceId() {
			return getSourceId()
		},
	})
}
