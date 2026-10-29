import { atom, Atom } from '@svelte-draw/state'
import { WeakCache } from '@svelte-draw/utils'
import { Editor } from '../editor/Editor'

/**
 * An Atom that is scoped to the lifetime of an Editor.
 *
 * This is useful for storing UI state for svelte-draw applications. Keeping state scoped to an editor
 * instead of stored in a global atom can prevent issues with state being shared between editors
 * when navigating between pages, or when multiple editor instances are used on the same page.
 *
 * @public
 */
export class EditorAtom<T> {
	private states = new WeakCache<Editor, Atom<T>>()

	constructor(
		private name: string,
		private getInitialState: (editor: Editor) => T
	) {}

	getAtom(editor: Editor): Atom<T> {
		return this.states.get(editor, () => atom(this.name, this.getInitialState(editor)))
	}

	get(editor: Editor): T {
		return this.getAtom(editor).get()
	}

	update(editor: Editor, update: (state: T) => T): T {
		return this.getAtom(editor).update(update)
	}

	set(editor: Editor, state: T): T {
		return this.getAtom(editor).set(state)
	}
}
