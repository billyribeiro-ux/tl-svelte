<script lang="ts">
	import {
		Avatar,
		formatRelativeTime,
		getLiveComments,
		getLiveCommentThreads,
		putCommentRecords,
		revealThread,
		richTextToPlaintext,
	} from '@svelte-draw/commenting'
	import {
		createComment,
		fromComputed,
		fromSignal,
		getEditor,
		SvelteDrawUiButton,
		SvelteDrawUiButtonLabel,
		toRichText,
		type TLCommentThread,
		type TLCommentThreadId,
		type TLRichText,
	} from 'svelte-draw'
	import {
		bodyMentioning,
		mentionedIds,
		ME,
		REASON_LABEL,
		readComments,
		resolveAuthor,
		resolveName,
		type Notification,
		type NotificationReason,
	} from './notifications'

	const editor = getEditor()
	const comments = fromComputed('all comments', () =>
		getLiveComments(editor).sort((a, b) => a.createdAt - b.createdAt)
	)
	const threads = fromComputed('comment threads', () => getLiveCommentThreads(editor))
	const read = fromSignal(readComments)

	// The threads you're a part of: ones you started, plus any you've commented in.
	const yourThreadIds = $derived.by(() => {
		const ids = new Set<TLCommentThreadId>(
			threads.current.filter((thread) => thread.createdBy === ME).map((thread) => thread.id)
		)
		for (const comment of comments.current) {
			if (comment.authorId === ME) ids.add(comment.threadId)
		}
		return ids
	})

	// [4]
	const notifications = $derived.by(() => {
		const result: Notification[] = []
		for (const comment of comments.current) {
			// A notification is always about someone else's comment, never your own.
			if (comment.authorId === ME) continue
			const reason: NotificationReason | null = mentionedIds(comment.body).includes(ME)
				? 'mention'
				: yourThreadIds.has(comment.threadId)
					? 'reply'
					: null
			if (!reason) continue
			result.push({ comment, reason, unread: !read.current.has(comment.id) })
		}
		return result.sort((a, b) => b.comment.createdAt - a.comment.createdAt)
	})

	const unreadCount = $derived(notifications.filter((n) => n.unread).length)

	// The newest thread of yours that Ada could reply into.
	const replyTarget = $derived(
		threads.current
			.filter((thread) => yourThreadIds.has(thread.id))
			.sort((a, b) => b.createdAt - a.createdAt)[0]
	)
	const mentionTarget = $derived([...threads.current].sort((a, b) => b.createdAt - a.createdAt)[0])

	// [5]
	const postAsAda = (body: TLRichText, thread: TLCommentThread | undefined) => {
		if (!thread) return
		putCommentRecords(editor, [
			createComment({ threadId: thread.id, pageId: thread.pageId, authorId: 'ada', body }),
		])
	}
</script>

<div class="tlui-menu comment-notifications">
	<div class="comment-notifications__header">
		<span class="comment-notifications__title">Inbox</span>
		{#if unreadCount > 0}<span class="comment-notifications__badge">{unreadCount}</span>{/if}
		<SvelteDrawUiButton
			type="normal"
			disabled={unreadCount === 0}
			onclick={() => readComments.set(new Set(comments.current.map((c) => c.id)))}
		>
			<SvelteDrawUiButtonLabel>Mark all read</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	</div>

	{#if notifications.length === 0}
		<p class="comment-notifications__empty">
			Nothing here yet. Comments that mention you, or that reply in one of your threads, land in
			this list.
		</p>
	{:else}
		<ul class="comment-notifications__list">
			{#each notifications as { comment, reason, unread } (comment.id)}
				<li>
					<button
						class="comment-notifications__row"
						data-unread={unread}
						onclick={() => revealThread(editor, comment.id)}
					>
						<!-- [6] -->
						<Avatar author={resolveAuthor(comment.authorId)} />
						<span class="comment-notifications__body">
							<span class="comment-notifications__meta">
								<b>{resolveAuthor(comment.authorId).name}</b>
								{REASON_LABEL[reason]} · {formatRelativeTime(
									new Date(comment.createdAt).toISOString()
								)}
							</span>
							<span class="comment-notifications__preview">
								{richTextToPlaintext(comment.body, resolveName)}
							</span>
						</span>
						{#if unread}<span class="comment-notifications__dot"></span>{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	<div class="comment-notifications__actions">
		<SvelteDrawUiButton
			type="normal"
			disabled={!replyTarget}
			onclick={() =>
				postAsAda(toRichText('One more thought on this — the spacing feels tight.'), replyTarget)}
		>
			<SvelteDrawUiButtonLabel>Ada replies</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
		<SvelteDrawUiButton
			type="normal"
			disabled={!mentionTarget}
			onclick={() => postAsAda(bodyMentioning('', ME, ' thoughts?'), mentionTarget)}
		>
			<SvelteDrawUiButtonLabel>Ada mentions you</SvelteDrawUiButtonLabel>
		</SvelteDrawUiButton>
	</div>
</div>
