import {
	computed,
	type Computed,
	Editor,
	isUninitialized,
	type TLComment,
	type TLCommentThreadId,
	WeakCache,
} from 'svelte-draw'
import { getLiveComments } from './comment-store'

/**
 * Every live comment grouped by thread, oldest first within each thread. One computed shared by
 * every mounted thread: each `createThreadComments` would otherwise scan and sort the whole comment
 * set, so N open threads did N full passes on every comment mutation. Cached per editor so the
 * grouping survives re-renders and is rebuilt only when the comment set actually changes.
 */
const commentsByThread = new WeakCache<Editor, Computed<Map<TLCommentThreadId, TLComment[]>>>()

/** Live comments grouped by thread id, cached per editor. @internal */
export function getCommentsByThread(editor: Editor) {
	return commentsByThread.get(editor, () =>
		computed('comments by thread', (prev) => {
			const byThread = new Map<TLCommentThreadId, TLComment[]>()
			for (const comment of getLiveComments(editor)) {
				const existing = byThread.get(comment.threadId)
				if (existing) existing.push(comment)
				else byThread.set(comment.threadId, [comment])
			}
			for (const [threadId, comments] of byThread) {
				comments.sort((a, b) => a.createdAt - b.createdAt)
				// Reuse the previous per-thread array when that thread's comment list is unchanged
				// (record identities are stable while unchanged), so `createThreadComments` subscribers
				// on other threads don't re-render when one thread gains a reply.
				if (isUninitialized(prev)) continue
				const prevComments = prev.get(threadId)
				if (
					prevComments &&
					prevComments.length === comments.length &&
					comments.every((comment, i) => prevComments[i] === comment)
				) {
					byThread.set(threadId, prevComments)
				}
			}
			return byThread
		})
	)
}

/** Shared empty result so a thread with no comments doesn't churn referential equality. @internal */
export const EMPTY_COMMENTS: TLComment[] = []
