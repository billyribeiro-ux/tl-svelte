import { fromComputed } from 'svelte-draw'
import { getMaybeApp } from '../../../hooks/useAppState.svelte'
import {
	buildReactionNotifications,
	categorizeCommentNotifications,
	mergeNotifications,
} from './commentNotifications'

/**
 * Comments and reactions surfaced as notifications, merged from the comment feeds and the
 * `reactions` synced query and sorted by timestamp. {@link categorizeCommentNotifications} and
 * {@link buildReactionNotifications} do the per-feed shaping. Shared by trigger button and panel.
 * Was `useCommentNotifications()`; read `.current.notifications` / `.current.unreadCount`.
 */
export function getCommentNotifications() {
	const app = getMaybeApp()
	return fromComputed('comment notifications', () => {
		const a = app.current
		const comments = categorizeCommentNotifications(a?.getComments() ?? [], a?.userId)
		const reactionEntries = buildReactionNotifications(a?.getReactions() ?? [], a?.userId)
		const notifications = mergeNotifications(comments, reactionEntries)
		const unreadCount = notifications.filter((n) => n.unread).length
		return { notifications, unreadCount }
	})
}
