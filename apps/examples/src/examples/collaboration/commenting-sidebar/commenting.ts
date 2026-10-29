import type { CommentAuthor, CommentingContext } from '@svelte-draw/commenting'

// A tiny local user directory so the list shows names instead of ids.
const AUTHORS: Record<string, CommentAuthor> = {
	me: { name: 'You', color: '#EC5E41' },
	ada: { name: 'Ada Lovelace', color: '#0E9F6E' },
	grace: { name: 'Grace Hopper', color: '#4465E9' },
}
const resolveAuthor = (id: string): CommentAuthor => AUTHORS[id] ?? { name: id }

// The canvas layer and the sidebar read the same context — who you are, and how author ids become
// names — so it's built once and spread into each rather than repeated on both.
export const commenting: CommentingContext = { currentUserId: 'me', resolveAuthor }
