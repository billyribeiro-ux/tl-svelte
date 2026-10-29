<script lang="ts">
	import type { TLComment } from 'svelte-draw'
	import CommentBody from './CommentBody.svelte'
	import { getContextCommentingOptions } from './options.svelte'

	/**
	 * A comment's body as the commenting layer renders it: the `CommentBody` component slot when the
	 * host set one, otherwise the built-in rich-text default (which resolves mention ids to names).
	 */
	let {
		comment,
		resolveName,
	}: { comment: TLComment; resolveName: (id: string) => string | undefined } = $props()

	const Body = getContextCommentingOptions().components.CommentBody
</script>

{#if Body}
	<Body {comment} />
{:else}
	<CommentBody richText={comment.body} {resolveName} />
{/if}
