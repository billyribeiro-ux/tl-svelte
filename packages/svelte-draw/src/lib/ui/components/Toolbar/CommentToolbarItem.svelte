<script lang="ts">
	import { createCommentingEnabled } from '../../hooks/useCommentingEnabled.svelte'
	import ToolbarItem from './ToolbarItem.svelte'

	/**
	 * Renders the comment tool if it has been registered (e.g. via `@svelte-draw/commenting`) and commenting
	 * is licensed. Renders nothing otherwise, so it's safe to include in the default toolbar for every
	 * editor.
	 */
	const commentingEnabled = createCommentingEnabled()
</script>

{#if commentingEnabled.current}
	<ToolbarItem tool="comment" />
{/if}
