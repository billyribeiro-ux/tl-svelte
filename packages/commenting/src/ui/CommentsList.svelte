<script lang="ts">
	import CommentListItem from './CommentListItem.svelte'
	import Content from './Content.svelte'
	import type { CommentsListProps } from './comments-list'

	/**
	 * A scrollable list of comment threads — each an avatar, byline, and a one-line preview.
	 * Presentational: you supply the items (already summarised) and an `onSelect` handler; the canvas
	 * `CanvasCommentsSidebar` wires it to the store, but a consumer can build their own list from this.
	 * @public
	 */
	let { items, onSelect, header, headerAction, empty, resolvedLabel, renderItem }: CommentsListProps =
		$props()
</script>

<div class="tlui-cmt-list">
	{#if header !== undefined || headerAction}
		<div class="tlui-cmt-list__header">
			{#if header !== undefined}
				<span class="tlui-cmt-list__header-title"><Content value={header} /></span>
			{/if}
			{@render headerAction?.()}
		</div>
	{/if}
	{#if items.length === 0}
		<div class="tlui-cmt-list__empty"><Content value={empty} /></div>
	{:else}
		<div class="tlui-cmt-list__items">
			{#each items as item (item.id)}
				{@const rowProps = { ...item, resolvedLabel, onSelect }}
				{#if renderItem}
					{@render renderItem(rowProps)}
				{:else}
					<CommentListItem {...rowProps} />
				{/if}
			{/each}
		</div>
	{/if}
</div>
