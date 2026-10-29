import type { CommentAuthor } from '@svelte-draw/mentions'
import type { Snippet } from 'svelte'
import type { CommentContent } from './content'
import type { ReactionSummary } from './reactions'

/** @public */
export interface CommentListItemProps {
	id: string
	author: CommentAuthor
	/** A short preview of the thread — e.g. the first comment's body. */
	preview: CommentContent
	/** ISO datetime of the thread's first comment. */
	date: string
	resolved?: boolean
	/** Name of the page the thread lives on, shown as a small label. Omit to hide. */
	page?: string
	/** Total comments in the thread. */
	count?: number
	/** Whether this thread is the open one. */
	selected?: boolean
	/** Tallied reactions for the row (a thread's, or a single comment's when the row is one
	 *  comment), shown as inert pills under the preview. Omit to hide. */
	reactions?: ReactionSummary[]
	/**
	 * Link target for the item. When set, the row renders as an anchor so browser affordances
	 * (ctrl/cmd-click, middle-click) open it in a new tab; a plain click still calls `onSelect`.
	 */
	href?: string
}

/**
 * What a row is rendered with: the item, plus the list-level wiring it needs to be interactive.
 * A custom row gets the same props the default `<CommentListItem>` does, so it can wrap the
 * default rather than reimplement it.
 *
 * @public
 */
export interface CommentListItemRenderProps extends CommentListItemProps {
	/** Label for a resolved thread's marker on its row. */
	resolvedLabel?: string
	/** Called with the thread id when the row is chosen. */
	onSelect?(id: string): void
}

/** @public */
export interface CommentsListProps {
	items: CommentListItemProps[]
	/** Called with a thread id when an item is chosen. */
	onSelect?(id: string): void
	/** Shown above the list (e.g. "Comments"). Omit for none. */
	header?: CommentContent
	/** Rendered at the right of the header row — e.g. a filter menu. */
	headerAction?: Snippet
	/** Shown in place of the list when there are no threads. */
	empty?: CommentContent
	/** Label for a resolved thread's marker on its row. Defaults to "Resolved". */
	resolvedLabel?: string
	/**
	 * Override how each item renders. Defaults to `<CommentListItem>`, which is exported — so a
	 * row that only adds something can spread these props into it rather than start over. The list
	 * keys the rows, so a custom row doesn't need to.
	 */
	renderItem?: Snippet<[CommentListItemRenderProps]>
}

/**
 * Whether a click should be left to the browser's link handling (new tab, new window, or download).
 * @public
 */
export function isOpenInNewTabClick(e: MouseEvent) {
	return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0
}
