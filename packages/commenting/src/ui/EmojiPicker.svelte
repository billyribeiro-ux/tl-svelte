<script lang="ts">
	import { DEFAULT_REACTION_EMOJI, type EmojiPickerProps } from './emoji-picker'
	import { defaultRenderReaction } from './Reaction.svelte'

	/**
	 * A grid of emoji to react with. Presentational and unpositioned — the host owns placement and
	 * dismissal; `ReactionPicker` renders it in a dropdown under the add-reaction button.
	 * @public
	 */
	let {
		emoji = DEFAULT_REACTION_EMOJI,
		selected,
		onSelect,
		renderReaction = defaultRenderReaction,
	}: EmojiPickerProps = $props()
</script>

<div class="tlui-cmt-emoji-picker" role="group">
	{#each emoji as value (value)}
		{@const active = selected?.includes(value) ?? false}
		<button
			type="button"
			class={active
				? 'tlui-cmt-emoji-picker__item tlui-cmt-emoji-picker__item--active'
				: 'tlui-cmt-emoji-picker__item'}
			aria-label={value}
			aria-pressed={active}
			onclick={(e) => onSelect?.(value, e)}
		>
			{@render renderReaction(value)}
		</button>
	{/each}
</div>
