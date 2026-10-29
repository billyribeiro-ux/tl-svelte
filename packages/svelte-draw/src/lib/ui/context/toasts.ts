import { type Atom, Editor, atom, uniqueId } from '@svelte-draw/editor'
import type { Snippet } from 'svelte'
import type { TLUiIconType } from '../icon-types'
import { defineUiContext } from './uiContext'

/** @public */
export type AlertSeverity = 'success' | 'info' | 'warning' | 'error'

/** @public */
export interface TLUiToast {
	id: string
	icon?: TLUiIconType
	iconLabel?: string
	severity?: AlertSeverity
	title?: string
	description?: string
	actions?: TLUiToastAction[]
	keepOpen?: boolean
	closeLabel?: string
}

/** @public */
export interface TLUiToastAction {
	type: 'primary' | 'danger' | 'normal'
	label: string
	onClick(): void
}

/** @public */
export interface TLUiToastsContextType {
	addToast(toast: Omit<TLUiToast, 'id'> & { id?: string }): string
	removeToast(id: TLUiToast['id']): string
	clearToasts(): void
	toasts: Atom<TLUiToast[]>
}

/** @public */
export interface TLUiToastsProviderProps {
	overrides?(editor: Editor): TLUiToastsContextType
	children: Snippet
}

const toastsContext = defineUiContext<TLUiToastsContextType>('svelte-draw.ui.toasts')

/** Creates the toast store. Replaces the `useAtom` + `useMemo` in the React provider. */
export function createToasts(): TLUiToastsContextType {
	const toasts = atom<TLUiToast[]>('toasts', [])
	return {
		toasts,
		addToast(toast: Omit<TLUiToast, 'id'> & { id?: string }) {
			const id = toast.id ?? uniqueId()
			toasts.update((d) => [...d.filter((m) => m.id !== toast.id), { ...toast, id }])
			return id
		},
		removeToast(id: string) {
			toasts.update((d) => d.filter((m) => m.id !== id))
			return id
		},
		clearToasts() {
			toasts.set([])
		},
	}
}

/** @internal */
export function setToasts(value: TLUiToastsContextType): void {
	toastsContext.set(value)
}

/** @internal */
export function tryGetToasts(): TLUiToastsContextType | null {
	return toastsContext.tryGet()
}

/** Replaces `useToasts`. Throws outside a provider. @public */
export function getToasts(): TLUiToastsContextType {
	return toastsContext.get('getToasts must be used within a SvelteDrawUiToastsProvider')
}
