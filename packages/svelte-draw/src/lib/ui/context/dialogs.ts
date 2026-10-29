import { type Atom, Editor, atom, tlmenus, uniqueId } from '@svelte-draw/editor'
import type { Component, Snippet } from 'svelte'
import { getUiEvents } from './events'
import { defineUiContext } from './uiContext'

/** @public */
export interface TLUiDialogProps {
	onClose(): void
}

/** @public */
export interface TLUiDialog {
	id: string
	onClose?(): void
	component: Component<TLUiDialogProps>
	preventBackgroundClose?: boolean
}

/** @public */
export interface TLUiDialogsContextType {
	addDialog(dialog: Omit<TLUiDialog, 'id'> & { id?: string }): string
	removeDialog(id: string): string
	clearDialogs(): void
	dialogs: Atom<TLUiDialog[]>
}

/** @public */
export interface TLUiDialogsProviderProps {
	context?: string
	overrides?(editor: Editor): TLUiDialogsContextType
	children: Snippet
}

const dialogsContext = defineUiContext<TLUiDialogsContextType>('svelte-draw.ui.dialogs')

/**
 * Creates the dialog store. Must be called during component initialisation, because it captures
 * the UI event handler from context.
 */
export function createDialogs(getContext?: () => string | undefined): TLUiDialogsContextType {
	const trackEvent = getUiEvents()
	const dialogs = atom<TLUiDialog[]>('dialogs', [])
	return {
		dialogs,
		addDialog(dialog: Omit<TLUiDialog, 'id'> & { id?: string }) {
			const id = dialog.id ?? uniqueId()
			dialogs.update((d) => {
				return [...d.filter((m) => m.id !== dialog.id), { ...dialog, id }]
			})
			trackEvent('open-menu', { source: 'dialog', id })
			tlmenus.addOpenMenu(id, getContext?.())
			return id
		},
		removeDialog(id: string) {
			const dialog = dialogs.get().find((d) => d.id === id)
			if (dialog) {
				dialog.onClose?.()
				trackEvent('close-menu', { source: 'dialog', id })
				tlmenus.deleteOpenMenu(id, getContext?.())
				dialogs.update((d) => d.filter((m) => m !== dialog))
			}
			return id
		},
		clearDialogs() {
			const current = dialogs.get()
			if (current.length === 0) return
			current.forEach((d) => {
				d.onClose?.()
				trackEvent('close-menu', { source: 'dialog', id: d.id })
				tlmenus.deleteOpenMenu(d.id, getContext?.())
			})
			dialogs.set([])
		},
	}
}

/** @internal */
export function setDialogs(value: TLUiDialogsContextType): void {
	dialogsContext.set(value)
}

/** @internal */
export function tryGetDialogs(): TLUiDialogsContextType | null {
	return dialogsContext.tryGet()
}

/** Replaces `useDialogs`. Throws outside a provider. @public */
export function getDialogs(): TLUiDialogsContextType {
	return dialogsContext.get('getDialogs must be used within a SvelteDrawUiDialogsProvider')
}
