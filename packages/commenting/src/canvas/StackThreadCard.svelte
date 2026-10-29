<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsUnknownAuthor: { id: 'comments.unknown-author', defaultMessage: 'Someone' },
		commentsPinLabel: { id: 'comments.pin-label', defaultMessage: 'Comment by {name}' },
		commentsPinLabelResolved: {
			id: 'comments.pin-label-resolved',
			defaultMessage: 'Resolved comment by {name}',
		},
	})
</script>

<script lang="ts">
	import { getTranslation, type Editor, type TLCommentThread } from 'svelte-draw'
	import CommentCard from '../ui/CommentCard.svelte'
	import CommentBodySlot from './CommentBodySlot.svelte'
	import type { CommentingContext } from './context'
	import { createThreadComments } from './hooks.svelte'
	import { toCardProps } from './thread-view'

	/** A collapsed stack entry: the thread's first comment as a card; clicking expands the thread. */
	let {
		editor,
		thread,
		onOpen,
		currentUserId,
		resolveAuthor,
	}: CommentingContext & { editor: Editor; thread: TLCommentThread; onOpen(): void } = $props()

	const msg = getTranslation()
	// The editor is fixed for a mounted view (as in React, where it was a context value).
	// svelte-ignore state_referenced_locally
	const comments = createThreadComments(editor, () => thread.id)
	const resolveName = (id: string) => resolveAuthor(id)?.name
	const first = $derived(comments.current[0])

	function open(e: MouseEvent) {
		e.stopPropagation()
		onOpen()
	}
</script>

{#if first}
	<!-- The card's keyboard affordance is the sibling button below; the wrapper's click is the
	     pointer convenience for the whole card. -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div class="tlui-cmt-stack-list__card" onclick={open}>
		<!-- The card's keyboard affordance. A button *wrapping* the card would put the comment
		     body inside it, and a body renders its links as real anchors — interactive content
		     nested in a button, which is an invalid content model and reads to assistive tech as a
		     broken control. So the button covers the card as a sibling instead, leaving the body's
		     own links above it and still reachable. -->
		<button
			type="button"
			class="tlui-cmt-button tlui-cmt-stack-list__card-action"
			aria-label={msg(
				thread.resolved ? messages.commentsPinLabelResolved : messages.commentsPinLabel,
				{
					name: resolveAuthor(thread.createdBy)?.name ?? msg(messages.commentsUnknownAuthor),
				}
			)}
			onclick={open}
		></button>
		{#snippet body()}
			<CommentBodySlot comment={first} {resolveName} />
		{/snippet}
		<CommentCard {...toCardProps(first, { currentUserId, resolveAuthor })} {body} />
	</div>
{/if}
