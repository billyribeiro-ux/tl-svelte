import type { Snippet } from 'svelte'
import type { CommentComposerProps } from './comment-composer'
import type { CommentCardProps } from './CommentCard.svelte'
import type { CommentContent } from './content'

/** @public */
export interface CommentThreadProps {
	/** The thread's comments, already adapted to card props (oldest first). */
	comments: CommentCardProps[]
	/** Optional header, e.g. "Thread". Omit for no header. */
	header?: CommentContent
	/** Action controls shown at the right of the header (resolve, delete, dismiss…). */
	headerActions?: Snippet
	/** When set, shows a banner above the comments (e.g. "Resolved by Jess"). */
	resolvedBanner?: CommentContent
	/** Reply composer props. Omit for a read-only thread (no composer). */
	composer?: CommentComposerProps
	/** Shown at the bottom of the thread (e.g. a sign-in prompt when there's no composer). When
	 *  both are set, the footer renders after the composer. */
	footer?: CommentContent
	/** Override how each comment renders. Defaults to `<CommentCard>`. */
	renderComment?: Snippet<[CommentCardProps, number]>
}
