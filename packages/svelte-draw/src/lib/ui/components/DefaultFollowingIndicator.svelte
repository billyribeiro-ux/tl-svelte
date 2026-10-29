<script lang="ts">
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import FollowingIndicatorInner from './FollowingIndicatorInner.svelte'

	/** @public */
	const editor = getEditor()
	const followingUserId = fromComputed('follow', () => editor.getInstanceState().followingUserId)
</script>

{#if followingUserId.current}
	<FollowingIndicatorInner userId={followingUserId.current} />
{/if}
