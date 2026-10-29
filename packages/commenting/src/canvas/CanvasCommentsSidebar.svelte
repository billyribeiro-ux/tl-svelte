<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsEmpty: { id: 'comments.empty', defaultMessage: 'No comments on this page yet.' },
		commentsEmptyFiltered: {
			id: 'comments.empty-filtered',
			defaultMessage: 'No comments match your filters.',
		},
		commentsResolved: { id: 'comments.resolved', defaultMessage: 'Resolved' },
		commentsTitle: { id: 'comments.title', defaultMessage: 'Comments' },
	})
</script>

<script lang="ts">
	import {
		fromComputed,
		getEditor,
		getTranslation,
		type TLCommentThread,
		type TLCommentThreadId,
	} from 'svelte-draw'
	import CommentListItem from '../ui/CommentListItem.svelte'
	import CommentsList from '../ui/CommentsList.svelte'
	import type { CommentListItemRenderProps } from '../ui/comments-list'
	import CommentsFilterMenu from './CommentsFilterMenu.svelte'
	import CommentsVisibilityToggle from './CommentsVisibilityToggle.svelte'
	import { UNKNOWN_COMMENT_AUTHOR } from './comment-render'
	import { sortSidebarRows, type CanvasCommentsSidebarProps, type SidebarRow } from './comments-sidebar'
	import { getCommentsByThread } from './hooks'
	import { createCommentThreads } from './hooks.svelte'
	import { createCommentingEnabled } from './license.svelte'
	import { getContextCommentingOptions } from './options.svelte'
	import { richTextToPlaintext } from './rich-text'
	import SidebarPanel from './SidebarPanel.svelte'
	import { commentsSidebarOpen, openThreadId, sidebarFilters } from './state'
	import { focusThread } from './thread-state'

	/**
	 * A comments list panel for the current page, shown while {@link commentsSidebarOpen} is set (e.g.
	 * toggled by a button). Clicking a thread brings its pin into view and opens it. Batteries-included
	 * over the store (a sibling to `CanvasComments`); `CommentsList` is exported for a differently-placed
	 * or always-on list.
	 * @public
	 */
	let {
		resolveAuthor,
		currentUserId,
		isCommentUnread,
		header,
		empty,
		getThreadHref,
	}: CanvasCommentsSidebarProps = $props()

	// Name-only view of the resolver, for the plaintext previews (which resolve @-mentions).
	const resolveName = (id: string) => resolveAuthor(id)?.name
	const editor = getEditor()
	const options = getContextCommentingOptions()
	const commentingEnabled = createCommentingEnabled()
	const msg = getTranslation()
	const threads = createCommentThreads(editor)
	const byThread = fromComputed('comments by thread', () => getCommentsByThread(editor).get())
	const currentPageId = fromComputed('page id', () => editor.getCurrentPageId())
	const open = fromComputed('sidebar open', () => commentsSidebarOpen.get(editor))
	const openId = fromComputed('open thread', () => openThreadId.get(editor))
	const filters = fromComputed('sidebar filters', () => sidebarFilters.get(editor))
	const pageNames = fromComputed(
		'page names',
		() => new Map(editor.getPages().map((page) => [page.id, page.name]))
	)

	const ThreadPreviewSlot = options.components.ThreadPreview
	// The `ThreadRow` component slot overrides the built-in row. It gets the thread record alongside
	// the summarized row, so host state on `thread.meta` is in reach without a second lookup. Indexed
	// once rather than scanned per row — this runs for every row on every update of the panel.
	const ThreadRow = options.components.ThreadRow
	// Keyed by plain string: a row's id comes back as one, not as a branded thread id.
	const threadsById = $derived(
		new Map<string, TLCommentThread>(threads.current.map((thread) => [thread.id, thread]))
	)

	const view = $derived.by(() => {
		if (!commentingEnabled.current || !open.current) return null
		const filter = filters.current
		const pageId = currentPageId.current
		const comments = byThread.current
		const names = pageNames.current
		// Page scoping is treated as scoping, not a filter: an empty page reads "no comments yet",
		// while a list emptied by the toggles below reads "nothing matches your filters".
		const pageThreads = threads.current.filter(
			(thread) => !filter.onlyCurrentPage || thread.pageId === pageId
		)

		const rows: SidebarRow[] = pageThreads
			.filter((thread) => filter.showResolved || thread.resolved == null)
			// "Only mine" is ignored without a known user — otherwise a persisted onlyMine=true would
			// empty the list for a signed-out viewer, with the (hidden) toggle giving no way to clear it.
			.filter(
				(thread) => !filter.onlyMine || currentUserId === null || thread.createdBy === currentUserId
			)
			// "Only unread" is likewise ignored without a read-status source.
			.filter(
				(thread) =>
					!filter.onlyUnread ||
					isCommentUnread === undefined ||
					(comments.get(thread.id) ?? []).some((c) => isCommentUnread(c.id))
			)
			.map((thread) => {
				const threadComments = comments.get(thread.id) ?? []
				const first = threadComments[0]
				// Comments arrive oldest-first, so the last one is the thread's most recent activity.
				const last = threadComments[threadComments.length - 1]
				// The `ThreadPreview` component slot overrides the built-in plaintext default; it is
				// rendered by `renderItem` below, so the row carries an empty placeholder.
				const preview = first && !ThreadPreviewSlot ? richTextToPlaintext(first.body, resolveName) : ''
				return {
					item: {
						id: thread.id,
						author: resolveAuthor(thread.createdBy) ?? UNKNOWN_COMMENT_AUTHOR,
						preview,
						date: new Date((first ?? thread).createdAt).toISOString(),
						resolved: thread.resolved != null,
						// The page label only earns its place when it adds information: multiple pages
						// exist, and the thread is somewhere other than where you already are.
						page:
							names.size > 1 && thread.pageId !== pageId ? names.get(thread.pageId) : undefined,
						count: threadComments.length,
						selected: openId.current === thread.id,
						href: getThreadHref?.(thread.id),
					},
					lastActivity: (last ?? thread).createdAt,
				}
			})

		return { pageThreads, items: sortSidebarRows(rows).map((row) => row.item) }
	})

	function focus(id: string) {
		const thread = threads.current.find((t) => t.id === id)
		if (thread) focusThread(editor, thread)
	}
</script>

<!-- A row, when either row slot is set. `ThreadPreview` replaces the preview text with the host's
     component; `ThreadRow` replaces the whole row. -->
{#snippet renderItem(rowProps: CommentListItemRenderProps)}
	{@const first = byThread.current.get(rowProps.id as TLCommentThreadId)?.[0]}
	{#snippet slotPreview()}
		{#if first && ThreadPreviewSlot}<ThreadPreviewSlot comment={first} />{/if}
	{/snippet}
	{@const itemProps =
		ThreadPreviewSlot && first ? { ...rowProps, preview: slotPreview } : rowProps}
	{#if ThreadRow}
		<!-- Can't happen without a thread — the items are built from these threads — but a row with
		     no thread has nothing to render, and the slot's contract says the record is there. -->
		{@const thread = threadsById.get(rowProps.id)}
		{#if thread}<ThreadRow {...itemProps} {thread} />{/if}
	{:else}
		<CommentListItem {...itemProps} />
	{/if}
{/snippet}

{#snippet headerAction()}
	<div class="tlui-cmt-list__header-actions">
		<CommentsVisibilityToggle />
		<CommentsFilterMenu
			canFilterByAuthor={currentUserId !== null}
			canFilterByUnread={isCommentUnread !== undefined}
		/>
	</div>
{/snippet}

{#if view}
	<SidebarPanel>
		<CommentsList
			items={view.items}
			header={header ?? msg(messages.commentsTitle)}
			{headerAction}
			empty={view.items.length === 0 && view.pageThreads.length > 0
				? msg(messages.commentsEmptyFiltered)
				: (empty ?? msg(messages.commentsEmpty))}
			resolvedLabel={msg(messages.commentsResolved)}
			onSelect={focus}
			renderItem={ThreadRow || ThreadPreviewSlot ? renderItem : undefined}
		/>
	</SidebarPanel>
{/if}
