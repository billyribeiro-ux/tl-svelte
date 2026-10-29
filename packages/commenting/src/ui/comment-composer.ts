import type { CommentAuthor, MentionMember } from '@svelte-draw/mentions'
import type { Snippet } from 'svelte'
import type { TLRichText } from 'svelte-draw'

/** @public */
export interface CommentComposerProps {
	author: CommentAuthor
	placeholder: string
	/** Controlled rich-text value. Omit for the presentational (display-only) composer. */
	value?: TLRichText
	onChange?(value: TLRichText): void
	/** Called on Send click or Enter. When set, the composer is interactive. */
	onSubmit?(): void
	sendLabel?: string
	/** Called when Up is pressed in an empty composer — e.g. to start editing the comment above,
	 *  the way chat apps edit your last message. With content in the field, Up moves the cursor. */
	onArrowUpWhenEmpty?(): void
	disabled?: boolean
	autoFocus?: boolean
	/** The leading element before the field. Defaults to the author's avatar. */
	leading?: Snippet
	/** Resolve the members matching an `@`-query (sync or async). Provide to enable mentions. */
	getMentionSuggestions?(query: string): MentionMember[] | Promise<MentionMember[]>
	/** Override a picker row's content. Defaults to avatar + name (+ secondary). */
	renderMentionSuggestion?: Snippet<[MentionMember]>
}
