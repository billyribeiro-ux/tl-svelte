<script lang="ts" module>
	import type { CommentAuthor } from '@svelte-draw/mentions'
	import type { Snippet } from 'svelte'

	/** @public */
	export interface CommentCardProps {
		author: CommentAuthor
		/** The rendered comment body. The card doesn't dictate a format — pass a `<CommentBody>`
		 *  for a comment's rich text, or any markup of your own. Optional so a host can adapt
		 *  comments to card data and render the body itself (see `CommentThread.renderComment`). */
		body?: Snippet
		/** ISO datetime; formatted to relative time by the component. */
		date: string
		you: boolean
		/** Whether the comment has been edited (shows an "edited" marker). */
		edited?: boolean
		/** Hover-revealed controls at the card's top-right (e.g. an edit affordance). */
		actions?: Snippet
		/** Content under the body, aligned with it rather than the avatar (e.g. a `<Reactions>` row). */
		footer?: Snippet
	}
</script>

<script lang="ts">
	import Byline from './Byline.svelte'

	/** A single comment: Avatar, Byline, and a body slot the consumer renders. @public */
	let { author, body, date, you, edited, actions, footer }: CommentCardProps = $props()
</script>

<div class={you ? 'tlui-cmt-card tlui-cmt-card--you' : 'tlui-cmt-card'}>
	<Byline {author} {date} {edited} />
	<div class="tlui-cmt-body">{@render body?.()}{@render footer?.()}</div>
	{#if actions !== undefined}
		<div class="tlui-cmt-card__actions">{@render actions()}</div>
	{/if}
</div>
