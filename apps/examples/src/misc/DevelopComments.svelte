<script lang="ts">
	import { CanvasComments, type CommentAuthor } from '@svelte-draw/commenting'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'

	// Comments are authored as the local user, so the develop page shows whatever name and color are
	// set in the preferences menu. Any other author id came from another tab of the same document.
	const editor = getEditor()
	const userId = fromComputed('develop comments user id', () => editor.user.getExternalId())
	const userName = fromComputed('develop comments user name', () => editor.user.getName())
	const userColor = fromComputed('develop comments user color', () => editor.user.getColor())
	// Read through `.current` so a consumer that calls this while rendering re-renders when the
	// preferences change.
	const resolveAuthor = (id: string): CommentAuthor =>
		id === userId.current
			? { name: userName.current || 'You', color: userColor.current }
			: { name: id }
</script>

<CanvasComments currentUserId={userId.current} {resolveAuthor} />
