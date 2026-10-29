import type { CommentAuthor, MentionMember } from '@svelte-draw/commenting'
import { atom, type TLComment, type TLCommentId, type TLRichText } from 'svelte-draw'

export const ME = 'me'

const ADA_AVATAR =
	'data:image/svg+xml,' +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="#0E9F6E"/><circle cx="14" cy="11" r="5" fill="#fff"/><ellipse cx="14" cy="24" rx="9" ry="7" fill="#fff"/></svg>`
	)

export const MEMBERS: MentionMember[] = [
	{ id: ME, name: 'You', color: '#EC5E41', you: true },
	{ id: 'ada', name: 'Ada Lovelace', color: '#0E9F6E', image: ADA_AVATAR },
	{ id: 'grace', name: 'Grace Hopper', color: '#4465E9' },
]

const AUTHORS: Record<string, CommentAuthor> = Object.fromEntries(MEMBERS.map((m) => [m.id, m]))
export function resolveAuthor(id: string): CommentAuthor {
	return AUTHORS[id] ?? { name: id }
}
export function resolveName(id: string) {
	return AUTHORS[id]?.name
}

// [1]
export const readComments = atom<ReadonlySet<TLCommentId>>('read comments', new Set())

export function isCommentUnread(commentId: TLCommentId) {
	return !readComments.get().has(commentId)
}

export function onCommentsRead(commentIds: TLCommentId[]) {
	return readComments.update((read) => {
		const unread = commentIds.filter((id) => !read.has(id))
		if (unread.length === 0) return read
		const next = new Set(read)
		for (const id of unread) next.add(id)
		return next
	})
}

// Your own comment is never news to you, so it's marked read the moment it's posted rather than
// waiting for the thread view to report it.
export function onPostComment(comment: TLComment) {
	return onCommentsRead([comment.id])
}

// [2]
export function mentionedIds(body: TLRichText): string[] {
	const ids: string[] = []
	const visit = (node: any) => {
		if (!node || typeof node !== 'object') return
		if (node.type === 'mention' && typeof node.attrs?.id === 'string') ids.push(node.attrs.id)
		if (Array.isArray(node.content)) node.content.forEach(visit)
	}
	visit(body)
	return ids
}

/**
 * A comment body of the form `<before>@Name<after>`, as the composer would produce it. Empty
 * `before`/`after` segments are dropped — a zero-length text node is invalid rich text.
 */
export function bodyMentioning(before: string, memberId: string, after: string): TLRichText {
	return {
		type: 'doc',
		content: [
			{
				type: 'paragraph',
				content: [
					...(before ? [{ type: 'text', text: before }] : []),
					{ type: 'mention', attrs: { id: memberId, label: resolveName(memberId) ?? memberId } },
					...(after ? [{ type: 'text', text: after }] : []),
				],
			},
		],
	}
}

// [3]
export type NotificationReason = 'mention' | 'reply'

export interface Notification {
	comment: TLComment
	reason: NotificationReason
	unread: boolean
}

export const REASON_LABEL: Record<NotificationReason, string> = {
	mention: 'mentioned you',
	reply: 'replied in your thread',
}

export const MINUTE = 60 * 1000
