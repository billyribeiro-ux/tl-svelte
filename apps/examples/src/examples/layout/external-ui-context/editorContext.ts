import { getContext, setContext } from 'svelte'
import type { Editor } from 'svelte-draw'

const KEY = Symbol('external-ui-editor')

export function setExternalEditor(get: () => Editor | null) {
	setContext(KEY, get)
}

/** Only call this from a descendant that is rendered once the editor exists. */
export function getExternalEditor(): Editor {
	const get = getContext<() => Editor | null>(KEY)
	const editor = get()
	if (!editor) throw new Error('ExternalToolbar rendered before the editor mounted')
	return editor
}
