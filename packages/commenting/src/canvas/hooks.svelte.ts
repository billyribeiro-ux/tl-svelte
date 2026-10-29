import {
	fromComputed,
	type Editor,
	type SignalValue,
	type TLComment,
	type TLCommentThread,
	type TLCommentThreadId,
} from 'svelte-draw'
import { getLiveComments, getLiveCommentThreads } from './comment-store'
import { EMPTY_COMMENTS, getCommentsByThread } from './hooks'
import { fromComputedWith } from './reactive.svelte'

/**
 * The comment threads that should render (pins, sidebar), reactively — the live set described by
 * {@link getLiveCommentThreads}. Use `getCommentThreads` for the unfiltered set, including
 * soft-deleted threads awaiting the server's prune. Read `.current` in a `$derived`, an `$effect`
 * or the template. Replaces `useCommentThreads`.
 *
 * @public
 */
export function createCommentThreads(editor: Editor): SignalValue<TLCommentThread[]> {
	return fromComputed('comment threads', () => getLiveCommentThreads(editor))
}

/**
 * A thread's live comments, oldest first, reactively. Pass the id as a getter so it follows a
 * reactive prop. Replaces `useThreadComments`.
 *
 * @public
 */
export function createThreadComments(
	editor: Editor,
	getThreadId: () => TLCommentThreadId
): SignalValue<TLComment[]> {
	return fromComputedWith(
		'thread comments',
		getThreadId,
		(threadId) => getCommentsByThread(editor).get().get(threadId) ?? EMPTY_COMMENTS
	)
}

/**
 * Every live comment in the store ({@link getLiveComments}), oldest first, reactively. Group by
 * `threadId` for per-thread lists. Replaces `useComments`.
 *
 * @public
 */
export function createComments(editor: Editor): SignalValue<TLComment[]> {
	return fromComputed('all comments', () =>
		getLiveComments(editor).sort((a, b) => a.createdAt - b.createdAt)
	)
}
