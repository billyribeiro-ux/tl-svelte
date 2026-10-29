import { type Atom, atom } from '@svelte-draw/editor'
import { defineUiContext } from './uiContext'

/** @public */
export type A11yPriority = 'polite' | 'assertive'

/** @public */
export interface TLUiA11y {
	msg: string | undefined
	priority?: A11yPriority
}

/** @public */
export interface TLUiA11yContextType {
	announce(msg: TLUiA11y): void
	currentMsg: Atom<TLUiA11y>
}

/** @public */
export interface A11yProviderProps {
	children: import('svelte').Snippet
}

const a11yContext = defineUiContext<TLUiA11yContextType>('svelte-draw.ui.a11y')

/** Creates the a11y announcer state. Replaces the `useAtom` + `useMemo` in the React provider. */
export function createA11y(): TLUiA11yContextType {
	const currentMsg = atom<TLUiA11y>('a11y', { msg: '', priority: 'assertive' })
	return {
		currentMsg,
		announce(msg: TLUiA11y) {
			if (!msg) return
			currentMsg.set(msg)
		},
	}
}

/** Provides an a11y announcer to descendants. Call during component initialisation. */
export function setA11y(value: TLUiA11yContextType): void {
	a11yContext.set(value)
}

/** Returns the a11y announcer, or `null` outside a provider. */
export function tryGetA11y(): TLUiA11yContextType | null {
	return a11yContext.tryGet()
}

/** Replaces `useA11y`. Throws outside a provider. @public */
export function getA11y(): TLUiA11yContextType {
	return a11yContext.get('getA11y must be used within a SvelteDrawUiA11yProvider')
}
