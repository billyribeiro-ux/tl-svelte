<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsPreviewMore: { id: 'comments.preview-more', defaultMessage: '{count} more' },
	})
</script>

<script lang="ts">
	import {
		EditorPortal,
		getTranslation,
		usePassThroughWheelEvents,
		type Editor,
		type TLComment,
		type TLCommentThread,
	} from 'svelte-draw'
	import CommentCard from '../ui/CommentCard.svelte'
	import { replyCountLabel } from '../ui/reply-count'
	import CommentBodySlot from './CommentBodySlot.svelte'
	import type { CommentingContext } from './context'
	import { createComments } from './hooks.svelte'
	import { selectPreviewCards, type ThreadPreviewVariant } from './thread-preview'
	import { POPOVER_OFFSET, toCardProps } from './thread-view'

	/**
	 * The hover panel: each thread's opening comment as a read-only card, capped with a "+N more" line.
	 * Mounted only while hovering, so its store subscription costs nothing at rest.
	 */
	let {
		editor,
		threads,
		variant,
		point,
		onSelectThread,
		onPointerEnter,
		onPointerLeave,
		currentUserId,
		resolveAuthor,
	}: Pick<CommentingContext, 'currentUserId' | 'resolveAuthor'> & {
		editor: Editor
		/** The marker's threads, in the order they should read (oldest first). */
		threads: readonly TLCommentThread[]
		/** What the marker's click opens, which this panel imitates. */
		variant: ThreadPreviewVariant
		/** The marker's anchor point in viewport space — the same origin its popover is placed from. */
		point: { x: number; y: number }
		/** Open a thread from its card. Omit to leave the cards inert. */
		onSelectThread?(thread: TLCommentThread): void
		/** The owning marker's hover handlers, so the panel counts as part of its hover region. */
		onPointerEnter?(): void
		onPointerLeave?(): void
	} = $props()

	const msg = getTranslation()
	// The editor is fixed for a mounted view (as in React, where it was a context value).
	// svelte-ignore state_referenced_locally
	const allComments = createComments(editor)
	const resolveName = (id: string) => resolveAuthor(id)?.name

	// The panel floats over the canvas and scrolls nothing of its own, so a wheel on it should zoom
	// and pan the canvas underneath — like every other svelte-draw panel, and like the popover it
	// previews. Without this the canvas would freeze wherever the preview happened to be.
	const passThroughWheelEvents = usePassThroughWheelEvents()

	// Each thread's opening comment and its total comment count. `createComments` is oldest-first, so
	// the first hit per thread is that thread's first comment. One pass over every comment beats a
	// per-thread reader — the thread count here is driven by cluster size, which has no fixed bound.
	const byThread = $derived.by(() => {
		const first = new Map<string, TLComment>()
		const count = new Map<string, number>()
		for (const comment of allComments.current) {
			if (!first.has(comment.threadId)) first.set(comment.threadId, comment)
			count.set(comment.threadId, (count.get(comment.threadId) ?? 0) + 1)
		}
		return { firstByThread: first, countByThread: count }
	})

	const preview = $derived(
		selectPreviewCards(threads, (thread) => byThread.firstByThread.get(thread.id))
	)

	// Placed at the same origin as the popover this previews, so the two only differ by what their
	// stylesheets do — see `.tlui-cmt-canvas-preview__panel--thread` for the header compensation.
	const offset = $derived(POPOVER_OFFSET[variant])
	// A thread preview is one comment on the panel itself, so the panel carries the hover and the
	// click. A list preview puts each thread on its own card, as the stack list does.
	const isThread = $derived(variant === 'thread')
	const panelClass = $derived(
		[
			'tlui-cmt-canvas-preview__panel',
			`tlui-cmt-canvas-preview__panel--${variant}`,
			isThread && onSelectThread ? 'tlui-cmt-canvas-preview__panel--selectable' : '',
		]
			.filter(Boolean)
			.join(' ')
	)
</script>

<!-- Nothing readable yet — render no panel rather than an empty one. It matters most for the
     thread variant, where the panel *is* the card's surface: an empty one would paint as a blank
     box floating on the canvas. -->
{#if preview.cards.length > 0}
	<EditorPortal>
		<!-- The root is the hover region — it carries the bridge back to the marker — while the panel
		     inside it is the visible surface. Keeping them apart is what lets the surface light up on
		     its own hover without the bridge (which reaches back over the marker) lighting it up too.
		     The press handler stays delegated to the app root, like React's synthetic event. -->
		<div
			class={`tlui-cmt-canvas-preview tlui-cmt-canvas-preview--${variant}`}
			style:left="{point.x + offset.x}px"
			style:top="{point.y + offset.y}px"
			style:--tlui-cmt-preview-offset="{offset.x}px"
			role="presentation"
			onpointerenter={() => onPointerEnter?.()}
			onpointerleave={() => onPointerLeave?.()}
			onpointerdown={(e) => e.stopPropagation()}
			{@attach passThroughWheelEvents}
		>
			<div class={panelClass}>
				{#each preview.cards as { thread, first } (thread.id)}
					<!-- The preview shows only the opening comment, so its reply count is what tells the
					     reader the thread continues past what they see. -->
					{@const replies = replyCountLabel(msg, (byThread.countByThread.get(thread.id) ?? 1) - 1)}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<div
						class={isThread
							? undefined
							: onSelectThread
								? 'tlui-cmt-preview-card tlui-cmt-preview-card--selectable'
								: 'tlui-cmt-preview-card'}
						onclick={onSelectThread
							? (e) => {
									e.stopPropagation()
									onSelectThread(thread)
								}
							: undefined}
					>
						{#snippet body()}
							<CommentBodySlot comment={first} {resolveName} />
						{/snippet}
						{#snippet footer()}
							{#if replies}<span class="tlui-cmt-card__replies">{replies}</span>{/if}
						{/snippet}
						<CommentCard
							{...toCardProps(first, { currentUserId, resolveAuthor })}
							{body}
							footer={replies ? footer : undefined}
						/>
					</div>
				{/each}
				{#if preview.overflow > 0}
					<div class="tlui-cmt-preview-more">
						{msg(messages.commentsPreviewMore, { count: preview.overflow })}
					</div>
				{/if}
			</div>
		</div>
	</EditorPortal>
{/if}
