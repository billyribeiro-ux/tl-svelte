import {
	fromComputed,
	getEditor,
	type Editor,
	type SignalValue,
	type TLComment,
	type TLCommentReaction,
} from 'svelte-draw'
import { getCommentReactions } from './comment-store'
import { fromComputedWith } from './reactive.svelte'

/**
 * One comment's reactions, oldest first, reactively. Pass the comment id as a getter so it follows
 * a reactive prop. Replaces `useCommentReactions`.
 *
 * @public
 */
export function createCommentReactions(
	editor: Editor,
	getCommentId: () => TLComment['id']
): SignalValue<TLCommentReaction[]> {
	return fromComputedWith('comment reactions', getCommentId, (commentId) =>
		getCommentReactions(editor)
			.filter((reaction) => reaction.commentId === commentId)
			.sort((a, b) => a.createdAt - b.createdAt)
	)
}

/** Whether any menu is open — the reaction hover list is suppressed while one is. */
export function createAnyMenuOpen(): SignalValue<boolean> {
	const editor = getEditor()
	return fromComputed('any menu open', () => editor.menus.getOpenMenus().length > 0)
}
