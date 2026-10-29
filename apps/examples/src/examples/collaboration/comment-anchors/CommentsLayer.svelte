<script lang="ts">
	import { CanvasComments, type CommentAuthor } from '@svelte-draw/commenting'

	// A demo avatar image (inline SVG) so Ada's comments show an image instead of a colored initial.
	const ADA_AVATAR =
		'data:image/svg+xml,' +
		encodeURIComponent(
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><rect width="28" height="28" fill="#0E9F6E"/><circle cx="14" cy="11" r="5" fill="#fff"/><ellipse cx="14" cy="24" rx="9" ry="7" fill="#fff"/></svg>`
		)

	const AUTHORS: Record<string, CommentAuthor> = {
		ada: { name: 'Ada Lovelace', color: '#0E9F6E', image: ADA_AVATAR },
		me: { name: 'You', color: '#EC5E41' },
	}
	const resolveAuthor = (id: string): CommentAuthor => AUTHORS[id] ?? { name: id }
</script>

<CanvasComments currentUserId="me" {resolveAuthor} />
