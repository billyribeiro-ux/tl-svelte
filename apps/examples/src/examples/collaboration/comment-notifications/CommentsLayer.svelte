<script lang="ts">
	import { CanvasComments, filterMentionMembers } from '@svelte-draw/commenting'
	import {
		isCommentUnread,
		MEMBERS,
		ME,
		onCommentsRead,
		onPostComment,
		resolveAuthor,
	} from './notifications'
</script>

<CanvasComments
	currentUserId={ME}
	{resolveAuthor}
	getMentionSuggestions={(query) => filterMentionMembers(MEMBERS, query)}
	{isCommentUnread}
	{onCommentsRead}
	{onPostComment}
/>
