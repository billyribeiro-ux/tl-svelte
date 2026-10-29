import type { TLComment, TLCommentThread } from 'svelte-draw'

/**
 * Hover previews for every canvas marker — a single pin, a coincident stack, or a cluster badge.
 * Hovering shows the thread(s) behind the marker as cards; the marker's own click is unchanged.
 *
 * The panel is live, not a passive tooltip: the pointer can travel into it and click a card to open
 * that thread. Two pieces make that work — the close delay survives the trip across the gap, and
 * the panel carries an invisible bridge over it (see `.tlui-cmt-canvas-preview::before`).
 *
 * Opening a thread from a card needs nothing more than setting `openThreadId`, even for one folded
 * inside a badge: `collectClusterLeaves` skips the open thread, so it drops out and renders itself.
 */

/** How long the pointer must rest on a marker before its preview appears. */
export const PREVIEW_OPEN_DELAY_MS = 180
/**
 * Grace period after the pointer leaves the marker *or* the panel — long enough to cross the gap
 * between them, which the bridge element covers geometrically.
 */
export const PREVIEW_CLOSE_DELAY_MS = 220
/** Cards shown before the panel falls back to a "+N more" line. */
export const PREVIEW_MAX_THREADS = 5

/** A thread paired with the comment that opens it — one card of a preview. */
export interface ThreadPreviewCard {
	thread: TLCommentThread
	first: TLComment
}

/**
 * The cards a marker's preview will show, and how many threads it will summarise as "+N more".
 *
 * A thread can exist before its opening comment does — a collaborator's, mid-sync. Those are
 * dropped rather than rendered blank, and don't count toward the overflow tally.
 */
export function selectPreviewCards(
	threads: readonly TLCommentThread[],
	firstCommentOf: (thread: TLCommentThread) => TLComment | undefined,
	max = PREVIEW_MAX_THREADS
): { cards: ThreadPreviewCard[]; overflow: number } {
	const readable: ThreadPreviewCard[] = []
	for (const thread of threads) {
		const first = firstCommentOf(thread)
		if (first) readable.push({ thread, first })
	}
	return { cards: readable.slice(0, max), overflow: Math.max(0, readable.length - max) }
}

/**
 * What a marker's click opens, which is what its preview imitates — the panel's surface, its
 * width, and how it lays a comment out.
 *
 * `'thread'` previews a single pin: a thread panel without the header. `'list'` previews a
 * coincident stack or a cluster: one card per thread, like the stack list.
 */
export type ThreadPreviewVariant = 'thread' | 'list'

/** Order a marker's threads for reading: oldest first, id as the tiebreak so it's stable. */
export function sortThreadsForPreview(
	threads: readonly TLCommentThread[]
): readonly TLCommentThread[] {
	return [...threads].sort((a, b) => a.createdAt - b.createdAt || (a.id < b.id ? -1 : 1))
}
