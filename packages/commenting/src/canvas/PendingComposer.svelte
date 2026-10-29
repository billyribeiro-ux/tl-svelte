<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsSend: { id: 'comments.send', defaultMessage: 'Send' },
		commentsAddPlaceholder: { id: 'comments.add-placeholder', defaultMessage: 'Add a comment…' },
	})
</script>

<script lang="ts">
	import { Avatar, isMentionPickerOpen } from '@svelte-draw/mentions'
	import {
		createComment,
		createCommentThread,
		EditorPortal,
		getTranslation,
		usePassThroughWheelEvents,
		type Editor,
		type TLRichText,
	} from 'svelte-draw'
	import CommentComposer from '../ui/CommentComposer.svelte'
	import { EMPTY_COMMENT, isCommentEmpty } from '../ui/comment-extensions'
	import CommentPin from '../ui/CommentPin.svelte'
	import {
		clearCommentDraft,
		getCommentDraft,
		NEW_COMMENT_DRAFT,
		saveCommentDraft,
	} from './comment-drafts'
	import { commitCommentMutation } from './comment-mutations'
	import { UNKNOWN_COMMENT_AUTHOR } from './comment-render'
	import type { PendingComment } from './comment-tool'
	import type { CommentingContext } from './context'
	import { createIsMobileCommenting, createMobilePlacement } from './mobile-placement.svelte'
	import { createCanComment, getContextCommentingOptions } from './options.svelte'
	import { fromComputedWith } from './reactive.svelte'
	import { pendingComment } from './state'

	/**
	 * The composer for a thread that doesn't exist yet: the comment tool has placed a point (or
	 * region) and is waiting on a first comment. Submitting creates the thread and its comment
	 * together; clicking away keeps the draft for the next placement.
	 */
	let {
		editor,
		pending,
		currentUserId,
		resolveAuthor,
		onPostComment,
		getMentionSuggestions,
		renderMentionSuggestion,
	}: CommentingContext & { editor: Editor; pending: PendingComment } = $props()

	const ComposerFallback = getContextCommentingOptions().components.ComposerFallback
	const canComment = createCanComment(() => currentUserId)
	const me = $derived(currentUserId ? resolveAuthor(currentUserId) : undefined)
	// Click-away keeps the draft (saved on every change) and the next placement composer
	// restores it — the flip side of dismissing without a discard warning.
	let text = $state.raw<TLRichText>(getCommentDraft(NEW_COMMENT_DRAFT) ?? EMPTY_COMMENT)
	let element = $state.raw<HTMLDivElement | null>(null)
	const msg = getTranslation()
	// Over this floating panel, a scroll reaches the canvas (except where it scrolls itself).
	const passThroughWheelEvents = usePassThroughWheelEvents()

	const point = fromComputedWith(
		'composer point',
		() => pending.point,
		(pagePoint) => editor.pageToViewport(pagePoint)
	)
	// On mobile the composer floats free of the pin so it can clear the software keyboard; desktop
	// keeps it pinned to the point.
	const isMobile = createIsMobileCommenting()
	const placed = createMobilePlacement(
		() => element,
		() => point.current,
		() => isMobile.current
	)

	// Dismiss on a click anywhere outside the composer (capture-phase, ahead of stopPropagation).
	$effect(() => {
		const onPointerDown = (e: PointerEvent) => {
			const el = element
			const target = e.target as HTMLElement | null
			if (!el || !target) return
			// A click in the composer, or in the mention picker it spawns (portaled elsewhere), is
			// not "outside" — keep the draft open so the pick can insert.
			if (el.contains(target) || target.closest('.tlui-cmt-mention-popup')) return
			// A press on the canvas is the comment tool's to handle: it ends the placement and returns
			// to select. Clearing here first would let that press re-place the composer instead.
			if (editor.getContainer().querySelector('.tl-canvas')?.contains(target)) return
			pendingComment.set(editor, null)
		}
		document.addEventListener('pointerdown', onPointerDown, true)
		return () => document.removeEventListener('pointerdown', onPointerDown, true)
	})

	function submit() {
		if (isCommentEmpty(text) || !currentUserId) return
		const userId = currentUserId
		const comment = commitCommentMutation(editor, ({ put }) => {
			const pageId = editor.getCurrentPageId()
			const thread = createCommentThread({
				pageId,
				anchor: pending.anchor,
				createdBy: userId,
			})
			const comment = createComment({
				threadId: thread.id,
				pageId,
				authorId: userId,
				body: text,
			})
			put([thread, comment])
			return comment
		})
		text = EMPTY_COMMENT
		clearCommentDraft(NEW_COMMENT_DRAFT)
		pendingComment.set(editor, null)
		// Posting ends the placement interaction — hand the comment tool back to select. Only from
		// the settled idle state: Enter can land while a fresh press is mid-gesture (the composer
		// trails the pointer), and switching tools under a held pointer would strand the gesture.
		if (editor.isIn('comment.idle')) editor.setCurrentTool('select')
		// The host's callback is its own operation, not part of the post's history scope. It runs
		// last so a throwing host can't strand the composer holding a draft of a posted comment.
		onPostComment?.(comment)
	}

	const stop = (e: Event) => e.stopPropagation()
</script>

<!-- The leading pin previews the pin this draft becomes: a white pin holding the author's avatar. -->
{#snippet draftAvatar()}
	<CommentPin><Avatar author={me ?? UNKNOWN_COMMENT_AUTHOR} /></CommentPin>
{/snippet}

<EditorPortal>
	<!-- The pointer/context handlers stay delegated to the app root (like React's synthetic
	     events), after the editor container's native listeners. -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={element}
		class={[
			'tlui-cmt-canvas-composer',
			pending.anchor.type === 'region' && 'tlui-cmt-canvas-composer--region',
			!canComment.current && 'tlui-cmt-canvas-composer--fallback',
		]}
		style:left="{placed.left}px"
		style:top="{placed.top}px"
		onpointerdown={stop}
		oncontextmenu={stop}
		onkeydown={(e) => {
			if (e.key === 'Escape' && !isMentionPickerOpen()) pendingComment.set(editor, null)
		}}
		{@attach passThroughWheelEvents}
	>
		<!-- `disabled` below: no user means no author for the record — a dead send button. -->
		{#if canComment.current}
			<CommentComposer
				author={me ?? UNKNOWN_COMMENT_AUTHOR}
				placeholder={msg(messages.commentsAddPlaceholder)}
				sendLabel={msg(messages.commentsSend)}
				value={text}
				onChange={(value) => {
					text = value
					saveCommentDraft(NEW_COMMENT_DRAFT, value)
				}}
				onSubmit={submit}
				disabled={isCommentEmpty(text) || !currentUserId}
				{getMentionSuggestions}
				{renderMentionSuggestion}
				autoFocus
				leading={draftAvatar}
			/>
		{:else if ComposerFallback}
			<ComposerFallback context="pending" />
		{/if}
	</div>
</EditorPortal>
