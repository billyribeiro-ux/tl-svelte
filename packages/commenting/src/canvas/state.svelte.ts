import { fromComputed, getEditor, type SignalValue } from 'svelte-draw'
import type { PendingComment } from './comment-tool'
import type { SidebarFilters } from './sidebar-filters'
import {
	commentsHidden,
	commentsSidebarOpen,
	getRevealThreadPending,
	openThreadId,
	pendingComment,
	sidebarFilters,
} from './state'

/**
 * Reactive readers for the transient commenting state, for the editor in context. Call during
 * component initialisation and read `.current` in a `$derived`, an `$effect` or the template.
 * They replace the `use*` hooks of the React API.
 */

/**
 * Reactive reader for {@link getRevealThreadPending}. Replaces `useRevealThreadPending`.
 *
 * Use it to notice a reveal that never lands — usually a deep link to a deleted comment. Give it a
 * grace period first, since a request also sits here while its records sync in, and re-check with
 * {@link getRevealThreadPending} when it elapses.
 *
 * @public
 */
export function createRevealThreadPending(): SignalValue<string | null> {
	const editor = getEditor()
	return fromComputed('pending reveal thread', () => getRevealThreadPending(editor))
}

/** Reader for the open thread id. Replaces `useOpenThreadId`.
 * @public */
export function createOpenThreadId(): SignalValue<string | null> {
	const editor = getEditor()
	return fromComputed('open thread id', () => openThreadId.get(editor))
}

/** Reader for the pending (being-placed) comment. Replaces `usePendingComment`.
 * @internal */
export function createPendingComment(): SignalValue<PendingComment | null> {
	const editor = getEditor()
	return fromComputed('pending comment', () => pendingComment.get(editor))
}

/** Reader for whether comment pins are hidden. Replaces `useCommentsHidden`.
 * @public */
export function createCommentsHidden(): SignalValue<boolean> {
	const editor = getEditor()
	return fromComputed('comments hidden', () => commentsHidden.get(editor))
}

/** Reader for whether the comments sidebar is open. Replaces `useCommentsSidebarOpen`.
 * @public */
export function createCommentsSidebarOpen(): SignalValue<boolean> {
	const editor = getEditor()
	return fromComputed('comments sidebar open', () => commentsSidebarOpen.get(editor))
}

/** Reader for the current sidebar filters. Replaces `useSidebarFilters`.
 * @public */
export function createSidebarFilters(): SignalValue<SidebarFilters> {
	const editor = getEditor()
	return fromComputed('sidebar filters', () => sidebarFilters.get(editor))
}
