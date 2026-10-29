import { getEditor, type SignalValue } from 'svelte-draw'
import {
	getCanComment,
	getCanModifyComment,
	getCommentingOptions,
	type CommentingOptions,
	type CommentModification,
} from './options'
import { fromComputedWith } from './reactive.svelte'

/**
 * The {@link CommentingOptions} of the editor in context. Options are fixed per editor (set at tool
 * registration), so this isn't reactive. Call during component initialisation. Replaces
 * `useCommentingOptions`.
 *
 * @public
 */
export function getContextCommentingOptions(): CommentingOptions {
	return getCommentingOptions(getEditor())
}

/**
 * Reactive reader for {@link getCanComment}: a `canComment` callback that reads signals
 * re-evaluates when they change. Pass the user id as a getter so it follows a reactive prop.
 * Replaces `useCanComment`.
 *
 * @public
 */
export function createCanComment(
	getCurrentUserId: () => string | null | undefined
): SignalValue<boolean> {
	const editor = getEditor()
	return fromComputedWith('can comment', getCurrentUserId, (currentUserId) =>
		getCanComment(editor, currentUserId)
	)
}

/**
 * Reactive reader for {@link getCanModifyComment}: a `canModifyComment` callback that reads
 * signals re-evaluates when they change. Replaces `useCanModifyComment`.
 *
 * @public
 */
export function createCanModifyComment(
	getCurrentUserId: () => string | null | undefined,
	getModification: () => CommentModification
): SignalValue<boolean> {
	const editor = getEditor()
	// Comment records are immutable, so the record itself is what changes when the thing being
	// checked changes. The inputs are read eagerly so the computed is rebuilt when they do.
	return fromComputedWith(
		'can modify comment',
		() => ({ currentUserId: getCurrentUserId(), modification: getModification() }),
		({ currentUserId, modification }) => getCanModifyComment(editor, currentUserId, modification)
	)
}
