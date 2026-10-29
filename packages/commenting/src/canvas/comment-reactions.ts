import {
	createCommentReaction,
	createCommentReactionId,
	type Editor,
	type TLComment,
} from 'svelte-draw'
import type { ReactionSummary } from '../ui/reactions'
import { commitCommentMutation } from './comment-mutations'
import { UNKNOWN_AUTHOR } from './comment-render'
import { getCommentReactions } from './comment-store'
import { getCommentingOptions } from './options'

/**
 * The reaction fields {@link summarizeReactions} needs — a structural subset of
 * {@link svelte-draw#TLCommentReaction}, so tallies can also be built from rows synced outside the
 * editor store.
 *
 * @public
 */
export interface ReactionSummaryInput {
	userId: string
	emoji: string
	createdAt: number
}

/**
 * Tally a comment's reactions into an entry per emoji, ordered by when that emoji was first used so
 * the row stays stable as later reactions arrive. `active` marks the current user's emoji and
 * `reactors` lists who reacted, in reaction order. `resolveName` names each reactor; an id it can't
 * name falls back to `unknownAuthorName`, never the raw user id. Pass a translated name for that:
 * this is a plain function, so it can't reach the translations itself.
 *
 * @public
 */
export function summarizeReactions(
	reactions: readonly ReactionSummaryInput[],
	currentUserId?: string | null,
	resolveName?: (userId: string) => string | undefined,
	opts?: { unknownAuthorName?: string }
): ReactionSummary[] {
	const unknownAuthorName = opts?.unknownAuthorName ?? UNKNOWN_AUTHOR
	const groups = new Map<
		string,
		{ count: number; active: boolean; firstAt: number; reactors: ReactionSummary['reactors'] }
	>()
	for (const reaction of reactions) {
		const mine = currentUserId != null && reaction.userId === currentUserId
		// Fall back to a generic name, never the raw user id, when the id can't be resolved.
		const reactor = { name: resolveName?.(reaction.userId) ?? unknownAuthorName, you: mine }
		const group = groups.get(reaction.emoji)
		if (group) {
			group.count++
			group.active ||= mine
			group.firstAt = Math.min(group.firstAt, reaction.createdAt)
			group.reactors.push(reactor)
		} else {
			groups.set(reaction.emoji, {
				count: 1,
				active: mine,
				firstAt: reaction.createdAt,
				reactors: [reactor],
			})
		}
	}
	return [...groups]
		.sort(([, a], [, b]) => a.firstAt - b.firstAt)
		.map(([emoji, group]) => ({
			emoji,
			count: group.count,
			active: group.active,
			reactors: group.reactors,
		}))
}

/**
 * Toggle one user's reaction with a given emoji on a comment.
 *
 * Each reaction is its own record keyed by (comment, user, emoji), so this only touches that user's
 * own records and two people reacting at once never conflict. Behaviour depends on
 * `allowMultipleReactions`:
 *
 * - **multiple** (default): the emoji toggles independently, leaving other reactions alone.
 * - **single**: a new emoji replaces the user's existing reaction; the same one removes it.
 *
 * @public
 */
export function toggleCommentReaction(
	editor: Editor,
	comment: TLComment,
	userId: string,
	emoji: string,
	now = Date.now()
): void {
	const { allowMultipleReactions, isAllowedReaction } = getCommentingOptions(editor)
	const targetId = createCommentReactionId(comment.id, userId, emoji)
	const mine = getCommentReactions(editor).filter(
		(reaction) => reaction.commentId === comment.id && reaction.userId === userId
	)
	const removing = mine.some((reaction) => reaction.id === targetId)
	// Only a token the configured palette allows may be added. Removals always go through — if a
	// reaction somehow carries an off-palette token, the user must still be able to clear it.
	if (!removing && !isAllowedReaction(emoji)) return
	commitCommentMutation(editor, ({ put, remove }) => {
		if (removing) {
			remove([targetId])
			return
		}
		// Single-select: a new emoji replaces the user's existing reaction(s) on this comment.
		if (!allowMultipleReactions && mine.length > 0) {
			remove(mine.map((reaction) => reaction.id))
		}
		put([
			createCommentReaction({
				commentId: comment.id,
				threadId: comment.threadId,
				pageId: comment.pageId,
				userId,
				emoji,
				now,
			}),
		])
	})
}

/** @public */
export interface CommentReactionsProps {
	comment: TLComment
	/** The reacting user. Null/omitted gives a read-only row (signed out): counts show, but the
	 *  pills don't toggle. */
	currentUserId?: string | null
	/** Names a reactor id for the hover list. Ids it can't name fall back to a generic "Someone". */
	resolveName?(userId: string): string | undefined
}

/** @public */
export interface CommentReactionPickerProps {
	comment: TLComment
	/** The reacting user. Null/omitted renders nothing — there's nobody to react as. */
	currentUserId?: string | null
	/** The emoji the picker offers. Defaults to `DEFAULT_REACTION_EMOJI`. */
	emoji?: string[]
}
