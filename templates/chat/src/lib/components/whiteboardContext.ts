import { getContext, setContext } from 'svelte'

/** What the whiteboard's custom share panel needs from the modal that contains it. */
export interface WhiteboardActionsContext {
	imageId: string | undefined
	onCancel: () => void
	onSave: () => void
}

const KEY = Symbol('whiteboard actions')

/** `getContext` reads the object's properties lazily, so pass an object with getters. */
export function setWhiteboardActions(actions: WhiteboardActionsContext) {
	setContext(KEY, actions)
}

export function getWhiteboardActions() {
	return getContext<WhiteboardActionsContext>(KEY)
}
