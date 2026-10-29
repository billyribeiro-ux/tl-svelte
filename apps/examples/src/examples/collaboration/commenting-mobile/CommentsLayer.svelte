<script lang="ts">
	import {
		CanvasComments,
		filterMentionMembers,
		type CommentAuthor,
		type MentionMember,
	} from '@svelte-draw/commenting'

	// A demo avatar image (inline SVG) so one author shows an image instead of a colored initial.
	const ADA_AVATAR =
		'data:image/svg+xml,' +
		encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="#0E9F6E"/><circle cx="14" cy="11" r="5" fill="#fff"/><ellipse cx="14" cy="24" rx="9" ry="7" fill="#fff"/></svg>`
		)

	// The people who can be @-mentioned. A real app would pull this from its own roster; the composer
	// filters this list as you type after `@`. Ids match the author directory below.
	const MEMBERS: MentionMember[] = [
		{ id: 'me', name: 'You', color: '#EC5E41', you: true },
		{ id: 'ada', name: 'Ada Lovelace', color: '#0E9F6E', image: ADA_AVATAR },
		{ id: 'grace', name: 'Grace Hopper', color: '#4465E9' },
		{ id: 'alan', name: 'Alan Turing', color: '#9C1FBE' },
	]

	// A tiny local user directory so the flow shows names, colors, and images instead of ids. A real
	// app would resolve these from its own identity system.
	const AUTHORS: Record<string, CommentAuthor> = Object.fromEntries(MEMBERS.map((m) => [m.id, m]))
	const resolveAuthor = (id: string): CommentAuthor => AUTHORS[id] ?? { name: id }
</script>

<!-- `CanvasComments` reads those records reactively and draws the pins, threads, and composer.
	Mounting it in front of the canvas is the entire UI layer. -->
<CanvasComments
	currentUserId="me"
	{resolveAuthor}
	getMentionSuggestions={(query) => filterMentionMembers(MEMBERS, query)}
/>
