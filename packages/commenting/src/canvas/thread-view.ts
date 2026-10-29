import type { TLComment } from 'svelte-draw'
import type { CommentCardProps } from '../ui/CommentCard.svelte'
import { UNKNOWN_COMMENT_AUTHOR } from './comment-render'
import type { CommentingContext } from './context'

/** How long the copy-link item reads "Link copied" before reverting. */
export const LINK_COPIED_MS = 2000

/**
 * What a thread's `getThreadHref` should put on the clipboard. Hosts may hand back a relative href,
 * which is meaningless once pasted elsewhere, so it's resolved against the current document first.
 * An href the URL parser can't make sense of is copied as-is rather than dropped.
 *
 * @internal
 */
export function absoluteThreadLink(href: string, base = window.location.href): string {
	try {
		return new URL(href, base).toString()
	} catch {
		return href
	}
}

/**
 * Adapt a comment to the data a `CommentCard` shows. The body (and any actions or footer) are
 * snippets, so the caller renders them: see `CommentBodySlot` for the body, which honours the
 * `CommentBody` component slot and otherwise renders the rich text.
 */
export function toCardProps(
	comment: TLComment,
	props: Pick<CommentingContext, 'currentUserId' | 'resolveAuthor'>
): Omit<CommentCardProps, 'body' | 'actions' | 'footer'> {
	return {
		author: props.resolveAuthor(comment.authorId) ?? UNKNOWN_COMMENT_AUTHOR,
		date: new Date(comment.createdAt).toISOString(),
		you: comment.authorId === props.currentUserId,
		edited: comment.editedAt != null,
	}
}

/** A pin is this square (mirrors `--tlui-cmt-pin-size`). The two marker kinds differ in size *and*
 *  anchor point, so lining their previews up means correcting for both. Keep in sync with the CSS. */
const PIN_SIZE = 28

/** A cluster/stack badge is this square (`--tlui-cmt-marker-size`) — pin-sized, so the marker
 *  kinds read as one family. Keep in sync with the stylesheet. */
const MARKER_SIZE = PIN_SIZE

/** Where a popover's top card sits vertically, measured from the marker visual's middle. */
const CARD_TOP_Y = -28

/** The horizontal gap between a marker visual's right edge and its popover/preview panel. The
 *  preview's hover bridge spans exactly this (see `--tlui-cmt-preview-bridge`). */
const PREVIEW_GAP = 6

/**
 * Where a marker's popover sits relative to the marker's anchor point. The hover preview uses the
 * same origins, so moving a popover here moves its preview with it.
 *
 * Both marker kinds hang off their point the same way (`translate(0, -100%)`), differing only in
 * size — so each offset clears its own width plus the shared gap, and re-bases the shared card-top
 * measure from its bottom anchor to its middle.
 */
export const POPOVER_OFFSET = {
	thread: { x: PIN_SIZE + PREVIEW_GAP, y: CARD_TOP_Y - PIN_SIZE / 2 },
	list: { x: MARKER_SIZE + PREVIEW_GAP, y: CARD_TOP_Y - MARKER_SIZE / 2 },
} as const
