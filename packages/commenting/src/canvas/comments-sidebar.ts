import type { CommentListItemProps } from '../ui/comments-list'
import type { CommentContent } from '../ui/content'
import type { CommentingContext } from './context'

/**
 * The host wiring for {@link CanvasCommentsSidebar}: the {@link CommentingContext} fields it reads,
 * plus the panel's own slots. A non-null `currentUserId` enables the "only your threads" filter, and
 * an `isCommentUnread` the "only unread" one. `CanvasComments` takes the same fields, so a host
 * mounting both can spread one object into each.
 *
 * @public
 */
export interface CanvasCommentsSidebarProps extends Pick<
	CommentingContext,
	'currentUserId' | 'resolveAuthor' | 'isCommentUnread' | 'getThreadHref'
> {
	/** Header above the list. */
	header?: CommentContent
	/** Shown when the page has no threads. */
	empty?: CommentContent
}

/** A list row paired with the sort key that isn't part of what the row displays. @public */
export interface SidebarRow {
	item: CommentListItemProps
	/** When the thread's most recent comment was posted — what the list orders by. */
	lastActivity: number
}

/**
 * Order the list: unresolved threads first, then by most recent activity, id as a stable tiebreak.
 * Recency is the thread's *latest* comment, not its first, so a thread someone just replied to rises
 * to the top instead of staying wherever it was started. (The row still shows the thread's opening
 * comment and its date — that's what identifies the thread; only the ordering follows the replies.)
 *
 * Exported so a hand-built list can match the sidebar's ordering instead of re-deriving it.
 *
 * @public
 */
export function sortSidebarRows(rows: readonly SidebarRow[]): readonly SidebarRow[] {
	return [...rows].sort(
		(a, b) =>
			Number(!!a.item.resolved) - Number(!!b.item.resolved) ||
			b.lastActivity - a.lastActivity ||
			(a.item.id < b.item.id ? -1 : 1)
	)
}
