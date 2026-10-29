<script lang="ts">
	import { SvelteDrawUiTooltip } from 'svelte-draw'
	import DefaultReactionTooltipContent from './DefaultReactionTooltipContent.svelte'
	import type { ReactionTooltipProps } from './reaction'

	/**
	 * The default reactor tooltip: hangs the built-in inline sentence (`DefaultReactionTooltipContent`)
	 * in a standard tooltip below the pill — the same tooltip the toolbar uses. Replace it via
	 * `CommentingComponents.ReactionTooltip` to present the reactor list any other way (a different box,
	 * avatars, a banner, anywhere on screen); it receives the pill as `children`.
	 * @public
	 */
	let { reactors, children }: ReactionTooltipProps = $props()
</script>

{#snippet content()}
	<DefaultReactionTooltipContent {reactors} />
{/snippet}

<SvelteDrawUiTooltip side="bottom" {content}>
	{#snippet child({ props })}
		{@render children({ props })}
	{/snippet}
</SvelteDrawUiTooltip>
