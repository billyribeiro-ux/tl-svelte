import { fromComputed, tryGetEditor } from '@svelte-draw/svelte'

/**
 * Whether the editor was given a collaboration config. Not reactive (the store props never change).
 * Replaces `useShowCollaborationUi`.
 *
 * @public
 */
export function getShowCollaborationUi(): boolean {
	const editor = tryGetEditor()
	return editor?.store.props.collaboration !== undefined
}

/**
 * The reactive collaboration sync status, or `null` without a collaboration config. Replaces
 * `useCollaborationStatus`.
 *
 * @public
 */
export function createCollaborationStatus() {
	const editor = tryGetEditor()
	return fromComputed('sync status', () => {
		if (!editor?.store.props.collaboration?.status) {
			return null
		}
		return editor.store.props.collaboration.status.get()
	})
}
