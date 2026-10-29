<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		actionDelete: { id: 'action.delete', defaultMessage: 'Delete' },
		commentsCopyLink: { id: 'comments.copy-link', defaultMessage: 'Copy link' },
		commentsDelete: { id: 'comments.delete', defaultMessage: 'Delete thread' },
		commentsDismiss: { id: 'comments.dismiss', defaultMessage: 'Dismiss' },
		commentsEdit: { id: 'comments.edit', defaultMessage: 'Edit' },
		commentsEditPlaceholder: {
			id: 'comments.edit-placeholder',
			defaultMessage: 'Edit comment…',
		},
		commentsLinkCopied: { id: 'comments.link-copied', defaultMessage: 'Link copied' },
		commentsMoreOptions: { id: 'comments.more-options', defaultMessage: 'More options' },
		commentsReopen: { id: 'comments.reopen', defaultMessage: 'Reopen' },
		commentsReplyPlaceholder: { id: 'comments.reply-placeholder', defaultMessage: 'Reply…' },
		commentsResolve: { id: 'comments.resolve', defaultMessage: 'Resolve' },
		commentsResolvedBy: { id: 'comments.resolved-by', defaultMessage: 'Resolved by {name}' },
		commentsSave: { id: 'comments.save', defaultMessage: 'Save' },
		commentsSend: { id: 'comments.send', defaultMessage: 'Send' },
		commentsThreadTitle: { id: 'comments.thread-title', defaultMessage: 'Comment' },
		commentsUnknownAuthor: { id: 'comments.unknown-author', defaultMessage: 'Someone' },
	})
</script>

<script lang="ts">
	import { untrack } from 'svelte'
	import {
		createComment,
		getContainer,
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiIcon,
		type Editor,
		type TLComment,
		type TLCommentThread,
		type TLRichText,
	} from 'svelte-draw'
	import type { CommentCardProps } from '../ui/CommentCard.svelte'
	import CommentCard from '../ui/CommentCard.svelte'
	import type { CommentComposerProps } from '../ui/comment-composer'
	import { EMPTY_COMMENT, isCommentEmpty } from '../ui/comment-extensions'
	import CommentComposer from '../ui/CommentComposer.svelte'
	import CommentThread from '../ui/CommentThread.svelte'
	import CommentBodySlot from './CommentBodySlot.svelte'
	import {
		clearCommentDraft,
		getCommentDraft,
		replyDraftSlot,
		saveCommentDraft,
	} from './comment-drafts'
	import {
		commitCommentMutation,
		deleteComment,
		deleteThread,
		editComment,
		reopenThread,
		resolveThread,
	} from './comment-mutations'
	import CommentReactionPicker from './CommentReactionPicker.svelte'
	import CommentReactions from './CommentReactions.svelte'
	import { UNKNOWN_COMMENT_AUTHOR } from './comment-render'
	import type { CommentingContext } from './context'
	import { createThreadComments } from './hooks.svelte'
	import MoreOptionsMenu from './MoreOptionsMenu.svelte'
	import { getCanModifyComment } from './options'
	import { createCanComment, createCanModifyComment, getContextCommentingOptions } from './options.svelte'
	import { fromComputedWith } from './reactive.svelte'
	import { openThreadId } from './state'
	import ThreadMenuItem from './ThreadMenuItem.svelte'
	import { absoluteThreadLink, LINK_COPIED_MS, toCardProps } from './thread-view'

	/**
	 * One thread's interactive view: its comments, the reply composer, edit-in-place on your own
	 * comments, and the resolve/delete actions. Read receipts are reported for every unread comment
	 * while mounted, so only mount it where the thread is actually being shown.
	 */
	let {
		editor,
		thread,
		currentUserId,
		resolveAuthor,
		onPostComment,
		isCommentUnread,
		onCommentsRead,
		getMentionSuggestions,
		renderMentionSuggestion,
		getThreadHref,
	}: CommentingContext & { editor: Editor; thread: TLCommentThread } = $props()

	const options = getContextCommentingOptions()
	// The editor is fixed for a mounted view (as in React, where it was a context value).
	// svelte-ignore state_referenced_locally
	const comments = createThreadComments(editor, () => thread.id)
	const msg = getTranslation()
	// A name-only view of the author resolver, for the mention/rich-text paths.
	const resolveName = (id: string) => resolveAuthor(id)?.name
	// Rebuilt only when the comments change, not on every update.
	const cards = $derived(
		comments.current.map((c) => toCardProps(c, { currentUserId, resolveAuthor }))
	)
	const me = $derived(currentUserId ? resolveAuthor(currentUserId) : undefined)
	// Composing, editing, deleting, and resolving are all gated on the viewer's permission. Where it's
	// withheld the composer gives way to the ComposerFallback slot and the affordances are hidden.
	const canComment = createCanComment(() => currentUserId)
	// Editing and deleting are further per-record: the author's to do by default, wider or narrower
	// under a `canModifyComment` callback. Computed for the thread's comments in one pass, since
	// `renderComment` is a callback rather than a component and can't create a reader per comment.
	const commentPermissions = fromComputedWith(
		'comment permissions',
		() => ({ comments: comments.current, currentUserId }),
		({ comments: list, currentUserId: userId }) =>
			new Map(
				list.map((comment) => [
					comment.id,
					{
						edit: getCanModifyComment(editor, userId, { action: 'edit-comment', comment }),
						delete: getCanModifyComment(editor, userId, { action: 'delete-comment', comment }),
					},
				])
			)
	)
	// Deleting a thread is its creator's by default (and server-enforced); `canModifyComment` is what
	// widens that. Still a commenting write, so `canComment` stays the outer gate.
	const canModifyThread = createCanModifyComment(
		() => currentUserId,
		() => ({ action: 'delete-thread', thread })
	)
	const canDeleteThread = $derived(canComment.current && canModifyThread.current)
	const ComposerFallback = options.components.ComposerFallback
	// An unsent reply survives closing the thread (saved on every change, keyed by thread id) —
	// the flip side of dismissing without a discard warning.
	// svelte-ignore state_referenced_locally
	let reply = $state.raw<TLRichText>(getCommentDraft(replyDraftSlot(thread.id)) ?? EMPTY_COMMENT)
	let editingId = $state<string | null>(null)
	let editText = $state.raw<TLRichText>(EMPTY_COMMENT)
	const canReply = $derived(canComment.current && !thread.resolved)
	const container = getContainer()
	// Resolved when the composer closes rather than held as an element: the card unmounts while the
	// composer stands in its place, so the node captured on the way in is gone by the way out.
	let editReturnFocus: (() => HTMLElement | null) | null = null

	// Tab from the canvas drops the caret in the reply box: a pin click leaves focus on the editor
	// container, so the first Tab would otherwise walk the app's UI. Capture phase, once per open thread.
	let focusReply = $state(false)
	let tabTaken = false
	let swallowTabUp = false
	$effect(() => {
		if (!canReply) {
			// Resolving unmounts the reply box under an open thread. Reopening it should feel like a
			// freshly opened thread: no autoFocus left armed from the last Tab, and Tab available again.
			focusReply = false
			tabTaken = false
			return
		}
		const doc = container.ownerDocument
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Tab' || e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return
			if (e.defaultPrevented || tabTaken) return
			// Focus rests on the container (or nothing) after a pin click. Anywhere else is deliberate, and
			// Tab belongs to whatever holds it.
			if (e.target !== container && e.target !== doc.body) return
			tabTaken = true
			swallowTabUp = true
			focusReply = true
			e.preventDefault()
			e.stopPropagation()
		}
		// The select tool navigates shapes on Tab's *keyup*, so a quick tap would both focus the reply and
		// step the selection. Swallow the release of the press we took, and only that one.
		const onKeyUp = (e: KeyboardEvent) => {
			if (e.key !== 'Tab' || !swallowTabUp) return
			swallowTabUp = false
			e.preventDefault()
			e.stopPropagation()
		}
		doc.addEventListener('keydown', onKeyDown, true)
		doc.addEventListener('keyup', onKeyUp, true)
		return () => {
			doc.removeEventListener('keydown', onKeyDown, true)
			doc.removeEventListener('keyup', onKeyUp, true)
		}
	})

	// Leaving the edit composer unmounts it while it holds focus, dropping focus to the editor
	// container — outside the thread, so a Tab from there walks the app's UI. Hand focus back to
	// whatever opened the composer instead.
	$effect(() => {
		if (editingId !== null) return
		const resolve = editReturnFocus
		editReturnFocus = null
		// Runs after Svelte has swapped the card back in, so the target is mounted again by now.
		resolve?.()?.focus()
	})

	// Reported as one batch so the host can record the receipts in a single write. The write flips
	// isCommentUnread to false, so re-runs find nothing to report.
	$effect(() => {
		if (!isCommentUnread || !onCommentsRead) return
		const unreadIds = comments.current
			.filter((comment) => isCommentUnread(comment.id))
			.map((c) => c.id)
		if (unreadIds.length > 0) {
			untrack(() => onCommentsRead(unreadIds))
		}
	})

	function postReply() {
		if (isCommentEmpty(reply) || !currentUserId) return
		const userId = currentUserId
		const comment = commitCommentMutation(editor, ({ put }) => {
			const comment = createComment({
				threadId: thread.id,
				pageId: thread.pageId,
				authorId: userId,
				body: reply,
			})
			put([comment])
			return comment
		})
		reply = EMPTY_COMMENT
		clearCommentDraft(replyDraftSlot(thread.id))
		// The host's callback is its own operation, not part of the post's history scope. It runs
		// last so a throwing host can't strand the composer holding a draft of a posted reply.
		onPostComment?.(comment)
	}

	function toggleResolve() {
		if (!currentUserId) return
		if (thread.resolved) reopenThread(editor, thread)
		else resolveThread(editor, thread, currentUserId)
	}

	// No `currentUserId` check: unlike a resolve, a delete stamps nothing on the record, so who may
	// make it is `canModifyComment`'s call alone (which withholds it from an unidentified viewer by
	// default).
	const removeThread = () => deleteThread(editor, thread)

	const ThreadActions = options.components.ThreadActions
	// The host's URL for this thread. Its presence is what puts "copy link" in the header menu.
	const threadHref = $derived(getThreadHref?.(thread.id))

	// Copy a thread's link, with a flag that stays set briefly afterwards so the control can confirm.
	// Only set once the write resolves, so a withheld clipboard doesn't claim a copy that didn't happen.
	let linkCopied = $state(false)
	$effect(() => {
		if (!linkCopied) return
		const timeout = window.setTimeout(() => (linkCopied = false), LINK_COPIED_MS)
		return () => window.clearTimeout(timeout)
	})
	function copyThreadLink() {
		if (threadHref === undefined) return
		navigator.clipboard?.writeText(absoluteThreadLink(threadHref)).then(
			() => (linkCopied = true),
			() => (linkCopied = false)
		)
	}

	function startEdit(comment: TLComment, { fromMoreMenu = false } = {}) {
		// Edit from the ⋯ menu comes back to that button, looked up again on the way out since the card
		// unmounts. Otherwise return to whatever held focus, ignoring the body and the editor container.
		const active = container.ownerDocument.activeElement
		editReturnFocus = fromMoreMenu
			? () => container.querySelector<HTMLElement>(`[data-cmt-more-for="${comment.id}"]`)
			: active instanceof HTMLElement && active !== container && active !== document.body
				? () => (active.isConnected ? active : null)
				: null
		editingId = comment.id
		editText = comment.body
	}

	function saveEdit() {
		const comment = comments.current.find((c) => c.id === editingId)
		if (!comment || isCommentEmpty(editText)) return
		editComment(editor, comment, editText)
		editingId = null
	}

	// Resolve and delete are commenting writes: behind `canComment`, plus the `currentUserId` a
	// resolve stamps into `resolved.by`.
	const resolveLabel = $derived(
		msg(thread.resolved ? messages.commentsReopen : messages.commentsResolve)
	)

	const composer = $derived<CommentComposerProps | undefined>(
		canReply
			? {
					author: me ?? UNKNOWN_COMMENT_AUTHOR,
					placeholder: msg(messages.commentsReplyPlaceholder),
					sendLabel: msg(messages.commentsSend),
					value: reply,
					onChange: (value: TLRichText) => {
						reply = value
						saveCommentDraft(replyDraftSlot(thread.id), value)
					},
					onSubmit: postReply,
					// Up in the empty reply box edits the comment directly above it, chat-style —
					// only when you're allowed to edit it (the same gate as the Edit link).
					onArrowUpWhenEmpty: () => {
						const last = comments.current[comments.current.length - 1]
						if (last && commentPermissions.current.get(last.id)?.edit) startEdit(last)
					},
					// No user, no author for the record — dead send button.
					disabled: isCommentEmpty(reply) || !currentUserId,
					getMentionSuggestions,
					renderMentionSuggestion,
					// Reuses the composer's own focus path, so the caret lands at the end of a
					// restored draft rather than in front of it.
					autoFocus: focusReply,
				}
			: undefined
	)
</script>

<!-- Swap a comment for a pre-filled composer while it's being edited; otherwise show the card,
     with the affordances the viewer is allowed on it. -->
{#snippet renderComment(card: CommentCardProps, index: number)}
	{@const comment = comments.current[index]}
	{@const permissions = commentPermissions.current.get(comment.id)}
	{#if editingId === comment.id}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="tlui-cmt-editing"
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					editingId = null
					e.stopPropagation()
				}
			}}
		>
			<CommentComposer
				author={card.author}
				placeholder={msg(messages.commentsEditPlaceholder)}
				value={editText}
				onChange={(value) => (editText = value)}
				onSubmit={saveEdit}
				sendLabel={msg(messages.commentsSave)}
				disabled={isCommentEmpty(editText)}
				{getMentionSuggestions}
				{renderMentionSuggestion}
				autoFocus
			/>
		</div>
	{:else}
		{#snippet body()}
			<CommentBodySlot {comment} {resolveName} />
		{/snippet}
		{#snippet footer()}
			<!-- Reacting is a commenting write: without `canComment` the tally renders read-only
			     (no identity → pills aren't clickable). -->
			<CommentReactions
				{comment}
				currentUserId={canComment.current ? currentUserId : null}
				{resolveName}
			/>
		{/snippet}
		<!-- Always passed (as React passed `false`, not undefined): the actions slot renders even
		     when empty. -->
		{#snippet actions()}
			{#if canComment.current}
				{#if permissions?.edit || permissions?.delete}
					<MoreOptionsMenu id={`comment-actions-${comment.id}`} moreFor={comment.id}>
						{#if permissions?.edit}
							<ThreadMenuItem
								label={msg(messages.commentsEdit)}
								onClick={() => startEdit(comment, { fromMoreMenu: true })}
							/>
						{/if}
						{#if permissions?.delete}
							<ThreadMenuItem
								label={msg(messages.actionDelete)}
								danger
								onClick={() => deleteComment(editor, comment)}
							/>
						{/if}
					</MoreOptionsMenu>
				{/if}
				<!-- Last so react is always the rightmost pill. -->
				<CommentReactionPicker {comment} {currentUserId} />
			{/if}
		{/snippet}
		<CommentCard {...card} {body} {footer} {actions} />
	{/if}
{/snippet}

{#snippet headerActions()}
	<!-- Host verbs — assign, link a ticket — sit ahead of the built-in actions. -->
	{#if ThreadActions}
		<ThreadActions {thread} comments={comments.current} />
	{/if}
	{#if threadHref !== undefined || canDeleteThread}
		<MoreOptionsMenu id={`comment-thread-actions-${thread.id}`}>
			<!-- A link is a read affordance: offered to anyone who can see the thread, including a
			     viewer who can't comment. `noClose` keeps the menu up so the item can confirm the copy
			     in place. -->
			{#if threadHref !== undefined}
				<ThreadMenuItem
					label={msg(linkCopied ? messages.commentsLinkCopied : messages.commentsCopyLink)}
					noClose
					onClick={copyThreadLink}
				/>
			{/if}
			{#if canDeleteThread}
				<ThreadMenuItem label={msg(messages.commentsDelete)} danger onClick={removeThread} />
			{/if}
		</MoreOptionsMenu>
	{/if}
	{#if canComment.current && currentUserId}
		<SvelteDrawUiButton
			type="icon"
			tooltip={resolveLabel}
			title={resolveLabel}
			class="tlui-cmt-thread__action"
			onclick={toggleResolve}
		>
			<SvelteDrawUiIcon icon="check" label={resolveLabel} small />
		</SvelteDrawUiButton>
	{/if}
	<SvelteDrawUiButton
		type="icon"
		tooltip={msg(messages.commentsDismiss)}
		title={msg(messages.commentsDismiss)}
		class="tlui-cmt-thread__action"
		onclick={() => openThreadId.set(editor, null)}
	>
		<SvelteDrawUiIcon icon="cross-2" label={msg(messages.commentsDismiss)} small />
	</SvelteDrawUiButton>
{/snippet}

{#snippet fallbackFooter()}
	{#if ComposerFallback}<ComposerFallback context="thread" />{/if}
{/snippet}

<CommentThread
	header={msg(messages.commentsThreadTitle)}
	{headerActions}
	{renderComment}
	comments={cards}
	resolvedBanner={thread.resolved
		? msg(messages.commentsResolvedBy, {
				name: resolveAuthor(thread.resolved.by)?.name ?? msg(messages.commentsUnknownAuthor),
			})
		: undefined}
	{composer}
	footer={!canComment.current && !thread.resolved && ComposerFallback ? fallbackFooter : undefined}
/>
