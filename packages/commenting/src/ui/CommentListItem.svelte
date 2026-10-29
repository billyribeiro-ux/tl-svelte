<script lang="ts">
	import { Avatar } from '@svelte-draw/mentions'
	import { getTranslation } from 'svelte-draw'
	import Byline from './Byline.svelte'
	import Content from './Content.svelte'
	import { isOpenInNewTabClick, type CommentListItemRenderProps } from './comments-list'
	import CheckIcon from './icons/CheckIcon.svelte'
	import Reactions from './Reactions.svelte'
	import { replyCountLabel } from './reply-count'

	/** One thread's row in a {@link CommentsList}. @public */
	let {
		id,
		author,
		preview,
		date,
		resolved,
		page,
		count,
		selected,
		reactions,
		href,
		resolvedLabel = 'Resolved',
		onSelect,
	}: CommentListItemRenderProps = $props()

	const msg = getTranslation()

	function handleClick(e: MouseEvent) {
		if (href && isOpenInNewTabClick(e)) return
		e.preventDefault()
		if (onSelect) onSelect(id)
	}

	// `count` is the thread's total comments; a reply is every comment after the opening one.
	const replies = $derived(count !== undefined ? replyCountLabel(msg, count - 1) : null)
	const className = $derived(
		selected ? 'tlui-cmt-list__item tlui-cmt-list__item--selected' : 'tlui-cmt-list__item'
	)
</script>

{#snippet inner()}
	<Avatar {author} />
	<div class="tlui-cmt-list__item-body">
		<Byline {author} {date} />
		<div class="tlui-cmt-list__item-preview"><Content value={preview} /></div>
		{#if reactions}
			<Reactions {reactions} canReact={false} enableHoverList={false} />
		{/if}
		{#if resolved || page !== undefined || replies}
			<div class="tlui-cmt-list__item-meta">
				{#if resolved}
					<span class="tlui-cmt-list__item-resolved">
						<CheckIcon />
						{resolvedLabel}
					</span>
				{/if}
				{#if page !== undefined}<span class="tlui-cmt-list__item-page">{page}</span>{/if}
				{#if replies}<span class="tlui-cmt-list__item-replies">{replies}</span>{/if}
			</div>
		{/if}
	</div>
{/snippet}

{#if href}
	<a {href} class={className} data-resolved={resolved || undefined} onclick={handleClick}>
		{@render inner()}
	</a>
{:else}
	<button type="button" class={className} data-resolved={resolved || undefined} onclick={handleClick}>
		{@render inner()}
	</button>
{/if}
