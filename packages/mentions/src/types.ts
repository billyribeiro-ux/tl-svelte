import type { Snippet } from 'svelte'
import type { CommentAuthor } from './comment-author'

/** @public */
export interface AvatarProps {
	author: CommentAuthor
}

/** @public */
export interface MentionProps {
	name: string
}

/** A person the composer's \@-mention picker can offer: a {@link CommentAuthor} plus its id and
 * picker-only display fields. @public */
export interface MentionMember extends CommentAuthor {
	id: string
	/** A secondary line under the name — e.g. an email or handle. Omit for a single-line row. */
	secondary?: string
	/** Marks the current user; shown as a "(You)" suffix after the name. */
	you?: boolean
	/** Hosts may carry extra fields; a custom `renderMember` can read them. */
	[key: string]: unknown
}

/** @public */
export interface MentionListProps {
	/** Members to choose from — already resolved for the current query by the host. */
	members: MentionMember[]
	/** Index of the highlighted row, driven by the composer's keyboard navigation. */
	activeIndex?: number
	/** Called when a member is chosen (click, or Enter on the active row). */
	onSelect?(member: MentionMember): void
	/** Shown when no member matches the query. Defaults to a translated "No matches". */
	emptyLabel?: string
	/** Override a row's content (inside the selectable button). Defaults to avatar + name (+ secondary). */
	renderMember?: Snippet<[MentionMember]>
}
