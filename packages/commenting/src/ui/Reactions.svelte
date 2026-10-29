<script lang="ts">
	import Reaction from './Reaction.svelte'
	import type { ReactionsProps } from './reactions'

	/**
	 * The row of tallied reactions under a comment. Presentational — the host supplies the summaries
	 * and owns what toggling does. Hovering a pill lists who reacted (see `Reaction`).
	 *
	 * The add-reaction affordance is a separate component (`ReactionPicker`) so it can live outside
	 * this row — on a comment card it sits with the card's hover actions, which keeps its position
	 * fixed as reactions are added here.
	 * @public
	 */
	let {
		reactions,
		onToggle,
		canReact = true,
		enableHoverList = true,
		renderReaction,
		ReactionTooltip,
	}: ReactionsProps = $props()
</script>

{#if reactions.length > 0}
	<div class="tlui-cmt-reactions">
		{#each reactions as reaction (reaction.emoji)}
			<Reaction
				{...reaction}
				{enableHoverList}
				{renderReaction}
				{ReactionTooltip}
				onClick={canReact ? () => onToggle?.(reaction.emoji) : undefined}
			/>
		{/each}
	</div>
{/if}
