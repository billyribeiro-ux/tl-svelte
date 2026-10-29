<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import ReactionPicker from '../ui/ReactionPicker.svelte'
	import { createCommentReactions } from './comment-reactions.svelte'
	import { toggleCommentReaction, type CommentReactionPickerProps } from './comment-reactions'
	import { getContextCommentingOptions } from './options.svelte'

	/**
	 * The add-reaction button for one comment. Belongs with the comment card's hover actions rather
	 * than in the reaction row, so opening it doesn't chase the row as reactions are added.
	 * @public
	 */
	let { comment, currentUserId, emoji }: CommentReactionPickerProps = $props()

	const editor = getEditor()
	const { components } = getContextCommentingOptions()
	const ReactionContent = components.ReactionContent
	const reactions = createCommentReactions(editor, () => comment.id)
	const selected = $derived(
		reactions.current
			.filter((reaction) => currentUserId != null && reaction.userId === currentUserId)
			.map((reaction) => reaction.emoji)
	)
</script>

{#snippet renderReaction(token: string)}
	{#if ReactionContent}<ReactionContent {token} />{/if}
{/snippet}

{#if currentUserId != null}
	<ReactionPicker
		{emoji}
		{selected}
		renderReaction={ReactionContent ? renderReaction : undefined}
		palette={components.ReactionPalette}
		menuId={`comment-reactions-${comment.id}`}
		onSelect={(value) => toggleCommentReaction(editor, comment, currentUserId, value)}
	/>
{/if}
