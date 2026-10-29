<script lang="ts">
	import CanvasCommentsLayer from './CanvasCommentsLayer.svelte'
	import type { CanvasCommentsProps } from './comments-overlay'
	import { createCommentingEnabled } from './license.svelte'

	/**
	 * A ready-to-use comments layer for a svelte-draw canvas: pins each thread at its anchor, opens a
	 * thread popover (with a reply composer) on click, and shows a composer where the comment tool
	 * placed a new thread. Reads/writes comment records straight from `editor.store`.
	 *
	 * It's the batteries-included default: every visible piece is a slot on
	 * `CommentTool.configure({ components })`, and the pieces it composes (`CommentPin`,
	 * `CommentThread`, `CommentComposer`, the hooks, the tool) are all exported, so a consumer can
	 * rebuild it from parts instead. The host wiring is the {@link CommentingContext}, which
	 * `CanvasCommentsSidebar` takes too.
	 *
	 * @public
	 */
	let props: CanvasCommentsProps = $props()

	// The inner component holds everything else, so it only mounts once the license resolves.
	const commentingEnabled = createCommentingEnabled()
</script>

{#if commentingEnabled.current}
	<CanvasCommentsLayer {...props} />
{/if}
