<script lang="ts">
	import { F } from 'svelte-draw'
	import type { CommentNotificationReason } from './commentNotifications'

	/** Byline for a notification row, phrased by why it's there. `<name>` wraps the author's name. */
	let {
		reason,
		author,
		reactors,
		nameClassName,
	}: {
		reason: CommentNotificationReason
		author: string
		/** Who reacted, for the `reaction` phrasing - see `summarizeForeignReactors`. */
		reactors: { names: string[]; others: number; total: number }
		nameClassName: string
	} = $props()

	const names = $derived(reactors.names)
	const others = $derived(reactors.others)
	const total = $derived(reactors.total)
	const a = $derived(names[0])
	const b = $derived(names[1])
</script>

{#snippet name(chunks: string)}
	<span class={nameClassName}>{chunks}</span>
{/snippet}

{#if reason === 'mention'}
	<F defaultMessage={'<name>{author}</name> mentioned you'} values={{ author }} tags={{ name }} />
{:else if reason === 'reply'}
	<F defaultMessage={'<name>{author}</name> replied'} values={{ author }} tags={{ name }} />
{:else if reason === 'owned-board'}
	<F
		defaultMessage={'<name>{author}</name> commented on your board'}
		values={{ author }}
		tags={{ name }}
	/>
{:else if reason === 'reaction'}
	{#if names.length === 0}
		<F
			defaultMessage={'{count, plural, one {Someone reacted to your comment} other {# people reacted to your comment}}'}
			values={{ count: total }}
		/>
	{:else if names.length === 1 && others === 0}
		<F
			defaultMessage={'<name>{author}</name> reacted to your comment'}
			values={{ author: a }}
			tags={{ name }}
		/>
	{:else if names.length === 2 && others === 0}
		<F
			defaultMessage={'<name>{a}</name> and <name>{b}</name> reacted to your comment'}
			values={{ a, b }}
			tags={{ name }}
		/>
	{:else if names.length === 1}
		<F
			defaultMessage={'<name>{author}</name> and {count, plural, one {# other} other {# others}} reacted to your comment'}
			values={{ author: a, count: others }}
			tags={{ name }}
		/>
	{:else}
		<F
			defaultMessage={'<name>{a}</name>, <name>{b}</name> and {count, plural, one {# other} other {# others}} reacted to your comment'}
			values={{ a, b, count: others }}
			tags={{ name }}
		/>
	{/if}
{/if}
