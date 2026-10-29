<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsUnknownAuthor: { id: 'comments.unknown-author', defaultMessage: 'Someone' },
	})
</script>

<script lang="ts">
	import { getEditor, getTranslation } from 'svelte-draw'
	import Reactions from '../ui/Reactions.svelte'
	import { createAnyMenuOpen, createCommentReactions } from './comment-reactions.svelte'
	import { summarizeReactions, toggleCommentReaction, type CommentReactionsProps } from './comment-reactions'
	import { getContextCommentingOptions } from './options.svelte'

	/**
	 * The tallied reaction row under one comment. Pair with `CommentReactionPicker`, which is what
	 * adds a reaction.
	 * @public
	 */
	let { comment, currentUserId, resolveName }: CommentReactionsProps = $props()

	const editor = getEditor()
	// Adapts the `ReactionContent` override into a `renderReaction` snippet for the presentational
	// components. Unset when no override is given, so they fall back to drawing the token string.
	const { components } = getContextCommentingOptions()
	const ReactionContent = components.ReactionContent
	const reactions = createCommentReactions(editor, () => comment.id)
	const msg = getTranslation()
	const unknownAuthorName = $derived(msg(messages.commentsUnknownAuthor))
	const summaries = $derived(
		summarizeReactions(reactions.current, currentUserId, resolveName, { unknownAuthorName })
	)
	// Suppress the hover list while any menu is open (the reaction picker, an overflow menu…) so it
	// doesn't compete with the menu the user is actually working in. Edit mode already hides the
	// pills entirely (the card becomes a composer), so it needs no special case here.
	const anyMenuOpen = createAnyMenuOpen()
</script>

{#snippet renderReaction(token: string)}
	{#if ReactionContent}<ReactionContent {token} />{/if}
{/snippet}

<Reactions
	reactions={summaries}
	canReact={currentUserId != null}
	enableHoverList={!anyMenuOpen.current}
	renderReaction={ReactionContent ? renderReaction : undefined}
	ReactionTooltip={components.ReactionTooltip}
	onToggle={(value) => {
		if (currentUserId == null) return
		toggleCommentReaction(editor, comment, currentUserId, value)
	}}
/>
