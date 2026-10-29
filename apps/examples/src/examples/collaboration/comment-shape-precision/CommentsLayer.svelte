<script lang="ts">
	import { CanvasComments, type CommentAuthor } from '@svelte-draw/commenting'

	const AUTHORS: Record<string, CommentAuthor> = { me: { name: 'You', color: '#EC5E41' } }
	const resolveAuthor = (id: string): CommentAuthor => AUTHORS[id] ?? { name: id }
</script>

<CanvasComments currentUserId="me" {resolveAuthor} />
