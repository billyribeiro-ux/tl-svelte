import { atom, fromSignal, type Editor } from 'svelte-draw'

export const globalEditor = atom<Editor | null>('globalEditor', null)

const globalEditorHolder = fromSignal(globalEditor)

/** Was `useGlobalEditor()`. `.current` is the editor once one has mounted. */
export function getGlobalEditor(): { readonly current: Editor | null } {
	return globalEditorHolder
}
