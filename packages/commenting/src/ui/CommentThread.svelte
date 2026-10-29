<script lang="ts">
	import CommentCard from './CommentCard.svelte'
	import CommentComposer from './CommentComposer.svelte'
	import type { CommentThreadProps } from './comment-thread'
	import Content from './Content.svelte'

	/**
	 * A comment thread: an optional header, an optional resolved banner, the comments, and an
	 * optional reply composer. Presentational — you supply the comments (as card props) and the
	 * composer's handlers; how each comment renders is overridable via `renderComment`.
	 * @public
	 */
	let {
		comments,
		header,
		headerActions,
		resolvedBanner,
		composer,
		footer,
		renderComment,
	}: CommentThreadProps = $props()
</script>

<div class="tlui-cmt-thread">
	{#if header !== undefined || headerActions !== undefined}
		<div class="tlui-cmt-thread__header">
			{#if header !== undefined}
				<span class="tlui-cmt-thread__title"><Content value={header} /></span>
			{/if}
			{#if headerActions !== undefined}
				<div class="tlui-cmt-thread__actions">{@render headerActions()}</div>
			{/if}
		</div>
	{/if}
	{#if resolvedBanner !== undefined}
		<div class="tlui-cmt-thread__resolved"><Content value={resolvedBanner} /></div>
	{/if}
	<div class="tlui-cmt-thread__list">
		{#each comments as comment, i (i)}
			<div>
				{#if renderComment}
					{@render renderComment(comment, i)}
				{:else}
					<CommentCard {...comment} />
				{/if}
			</div>
		{/each}
	</div>
	{#if composer !== undefined}
		<CommentComposer {...composer} />
	{/if}
	{#if footer !== undefined}
		<div class="tlui-cmt-thread__footer"><Content value={footer} /></div>
	{/if}
</div>
