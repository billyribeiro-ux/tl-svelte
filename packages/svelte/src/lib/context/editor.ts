import type { Editor } from '@svelte-draw/editor'
import { getContext, setContext } from 'svelte'

const EDITOR_KEY = Symbol('svelte-draw.editor')
const CONTAINER_KEY = Symbol('svelte-draw.container')

/** Provides the editor to every descendant component. Call during component initialisation. */
export function setEditor(editor: Editor): void {
	setContext(EDITOR_KEY, editor)
}

/** Returns the editor, or `null` when called outside of an editor tree. */
export function tryGetEditor(): Editor | null {
	return getContext<Editor | undefined>(EDITOR_KEY) ?? null
}

/** Returns the editor. Throws outside of an editor tree. */
export function getEditor(): Editor {
	const editor = tryGetEditor()
	if (!editor) {
		throw new Error(
			'getEditor must be used inside of the <SvelteDraw /> or <SvelteDrawEditor /> components'
		)
	}
	return editor
}

/** Provides the editor's container element to every descendant component. */
export function setContainer(container: HTMLElement): void {
	setContext(CONTAINER_KEY, container)
}

/** Returns the editor's container element. Throws outside of an editor tree. */
export function getContainer(): HTMLElement {
	const container = getContext<HTMLElement | undefined>(CONTAINER_KEY)
	if (!container) {
		throw new Error(
			'getContainer must be used inside of the <SvelteDraw /> or <SvelteDrawEditor /> components'
		)
	}
	return container
}
