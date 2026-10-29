<script lang="ts" module>
	import { createDeepLinkString, defineMessages, type TLShapeId } from 'svelte-draw'
	import { routes } from '../../../../routeDefs'

	const messages = defineMessages({
		title: { defaultMessage: 'Notifications' },
		close: { defaultMessage: 'Close' },
		empty: { defaultMessage: 'You’re all caught up.' },
		unknownAuthor: { defaultMessage: 'Someone' },
	})

	/** Deep link to a comment's file, anchored to its shape (when shape-anchored) so its popover opens. */
	function commentLink(fileId: string, shapeId: string | null | undefined, commentId: string) {
		const base = `${routes.tlaFile(fileId)}?comment=${encodeURIComponent(commentId)}`
		if (!shapeId) return base
		const d = createDeepLinkString({ type: 'shapes', shapeIds: [shapeId as TLShapeId] })
		return `${base}&d=${d}`
	}
</script>

<script lang="ts">
	import {
		type CommentListItemProps,
		type CommentListItemRenderProps,
		CommentsList,
		formatFullDateTime,
		formatRelativeTime,
		isOpenInNewTabClick,
		Reactions,
		richTextToPlaintext,
		summarizeReactions,
	} from '@svelte-draw/commenting'
	import {
		getTranslation,
		SvelteDrawUiButton,
		SvelteDrawUiTooltip,
		type TLRichText,
	} from 'svelte-draw'
	import { getIntl } from '../../../../utils/intl'
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import TlaIcon from '../../TlaIcon/TlaIcon.svelte'
	import { getCommentNotifications } from './getCommentNotifications'
	import { summarizeForeignReactors } from './commentNotifications'
	import TlaSidebarNotificationReasonByline from './TlaSidebarNotificationReasonByline.svelte'
	import TlaSidebarNotificationsOverflowMenu, {
		type NotificationFilter,
	} from './TlaSidebarNotificationsOverflowMenu.svelte'
	import styles from './notifications.module.css'

	/**
	 * Notifications popover contents. Reuses the comments sidebar's list shell (header, scroll, empty)
	 * but renders each row person-first - an author-coloured pin and a name-led byline (who, and why
	 * you're being notified), the comment preview and any reaction pills beneath, and an unread dot.
	 */
	let { onClose }: { onClose(): void } = $props()

	const msg = getTranslation()
	const app = getMaybeApp()
	const intl = getIntl()
	const notificationState = getCommentNotifications()
	let filter = $state<NotificationFilter>('all')

	const notifications = $derived(notificationState.current.notifications)
	const unreadCount = $derived(notificationState.current.unreadCount)
	const visible = $derived(filter === 'unread' ? notifications.filter((n) => n.unread) : notifications)

	const items: CommentListItemProps[] = $derived(
		visible.map((n) => {
			const c = n.comment
			return {
				id: c.id,
				author: {
					// never fall back to the raw id: an opaque uuid as a byline reads as a bug, and the rest
					// of the commenting UI says "Someone" for an unresolvable author
					name: c.authorName || msg(messages.unknownAuthor),
					color: c.authorColor || undefined,
				},
				preview: richTextToPlaintext(c.body as TLRichText),
				// the notified-about event: a reaction entry dates from its newest foreign reaction,
				// not from the (older) comment it decorates
				date: new Date(n.timestamp).toISOString(),
				// inert pills: no toggling from the panel, emoji + count with the user's own
				// reactions highlighted
				reactions: summarizeReactions(
					c.reactions ?? [],
					app.current?.userId,
					(id) => c.reactions?.find((r) => r.userId === id)?.userName || undefined
				),
				// a real link target, so browser affordances (ctrl/cmd-click, middle-click) open a new tab
				href: commentLink(c.fileId, c.thread?.shapeId, c.id),
			}
		})
	)

	// Row id -> its notification, for the byline's reason/reactors and the unread dot.
	const notificationById = $derived(new Map(visible.map((n) => [n.comment.id, n])))

	function markAllRead() {
		const a = app.current
		if (!a) return
		// one batched mutation rather than one markRead per comment. A reaction entry carries its
		// own unread state (a fresh reaction re-unreads a read comment), so this filters on the
		// entry rather than on the comment's receipt - and repeats are fine, since the mutator
		// dedupes the batch.
		a.markCommentsRead(notifications.filter((n) => n.unread).map((n) => n.comment.id))
	}

	function handleSelect(id: string, isNewTab: boolean) {
		const n = notifications.find((n) => n.comment.id === id)
		if (!n) return
		if (n.unread) app.current?.markCommentRead(n.comment.id)
		// keep the popover open when opening in a new tab, so more can be opened
		if (!isNewTab) onClose()
	}
</script>

{#snippet headerAction()}
	<div class="tlui-cmt-list__header-actions">
		<TlaSidebarNotificationsOverflowMenu
			{filter}
			onFilterChange={(next) => (filter = next)}
			onMarkAllRead={markAllRead}
			hasUnread={unreadCount > 0}
		/>
		<SvelteDrawUiButton
			type="icon"
			title={msg(messages.close)}
			class="tlui-cmt-header-btn"
			onclick={onClose}
		>
			<TlaIcon icon="close" style="width: 12px; height: 12px" />
		</SvelteDrawUiButton>
	</div>
{/snippet}

{#snippet renderItem(item: CommentListItemRenderProps)}
	{@const n = notificationById.get(item.id)}
	<!-- middle-click opens the tab natively without firing onclick; still mark it read -->
	<a
		href={item.href!}
		class="tlui-cmt-list__item"
		onclick={(e) => handleSelect(item.id, isOpenInNewTabClick(e))}
		onauxclick={(e) => e.button === 1 && handleSelect(item.id, true)}
	>
		<span class={styles.pin} style:background-color={item.author.color} aria-hidden="true"></span>
		<div class="tlui-cmt-list__item-body">
			<div class={styles.head}>
				<span class={styles.byline}>
					<TlaSidebarNotificationReasonByline
						reason={n?.primaryReason ?? 'owned-board'}
						author={item.author.name}
						reactors={summarizeForeignReactors(n?.comment.reactions, app.current?.userId)}
						nameClassName={styles.author}
					/>
				</span>
				<SvelteDrawUiTooltip content={formatFullDateTime(item.date, intl.current.locale)}>
					{#snippet child({ props })}
						<span {...props} class={styles.time}>{formatRelativeTime(item.date)}</span>
					{/snippet}
				</SvelteDrawUiTooltip>
			</div>
			<div class={styles.preview}>{item.preview}</div>
			{#if item.reactions}
				<Reactions reactions={item.reactions} canReact={false} enableHoverList={false} />
			{/if}
		</div>
		{#if n?.unread}<span class={styles.unreadDot} aria-hidden="true"></span>{/if}
	</a>
{/snippet}

<div class={styles.wrap}>
	<CommentsList
		{items}
		header={msg(messages.title)}
		{headerAction}
		empty={msg(messages.empty)}
		{renderItem}
	/>
</div>
