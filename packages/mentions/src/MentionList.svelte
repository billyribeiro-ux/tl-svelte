<script lang="ts">
	import { defineMessages, translateMessage } from '@svelte-draw/editor'
	import { tryGetEditor } from '@svelte-draw/svelte'
	import type { HTMLAttributes } from 'svelte/elements'
	import Avatar from './Avatar.svelte'
	import type { MentionListProps, MentionMember } from './types'

	const messages = defineMessages({
		commentsMentionNoMatches: { id: 'comments.mention-no-matches', defaultMessage: 'No matches' },
		commentsMentionYou: { id: 'comments.mention-you', defaultMessage: 'You' },
	})

	/**
	 * The \@-mention member picker: a popover list of people to mention, shown as the user types after
	 * `@`. Presentational — the composer's suggestion plugin owns resolution, keyboard navigation, and
	 * placement, and drives this with the host-resolved `members` and the highlighted `activeIndex`.
	 * Extra attributes and attachments land on the list's root element.
	 */
	let {
		members,
		activeIndex = 0,
		onSelect,
		emptyLabel,
		renderMember,
		...rest
	}: MentionListProps & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class' | 'role'> =
		$props()

	const editor = tryGetEditor()
	const msg = (message: (typeof messages)[keyof typeof messages]) =>
		translateMessage(editor?.i18n(), message)
</script>

{#snippet defaultMemberRow(member: MentionMember)}
	<Avatar author={member} />
	<span class="tlui-cmt-mention-list__text">
		<span class="tlui-cmt-mention-list__name">
			{member.name}
			{#if member.you}
				<span class="tlui-cmt-mention-list__you">{`(${msg(messages.commentsMentionYou)})`}</span>
			{/if}
		</span>
		{#if member.secondary}
			<span class="tlui-cmt-mention-list__secondary">{member.secondary}</span>
		{/if}
	</span>
{/snippet}

{#if members.length === 0}
	<div {...rest} class="tlui-cmt-mention-list tlui-cmt-mention-list--empty">
		{emptyLabel ?? msg(messages.commentsMentionNoMatches)}
	</div>
{:else}
	<div {...rest} class="tlui-cmt-mention-list" role="listbox">
		{#each members as member, i (member.id)}
			{@const active = i === activeIndex}
			<!-- Keep the composer focused on a row press: it's portaled outside the editor, so a
			     bare mousedown would blur the composer — which now dismisses the picker — before
			     the click could select. Selection runs on click; focus stays put. -->
			<button
				type="button"
				role="option"
				aria-selected={active}
				class={active
					? 'tlui-cmt-mention-list__item tlui-cmt-mention-list__item--active'
					: 'tlui-cmt-mention-list__item'}
				onmousedown={(e) => e.preventDefault()}
				onclick={() => onSelect?.(member)}
			>
				{#if renderMember}
					{@render renderMember(member)}
				{:else}
					{@render defaultMemberRow(member)}
				{/if}
			</button>
		{/each}
	</div>
{/if}
