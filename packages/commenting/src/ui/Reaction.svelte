<script lang="ts" module>
	export { defaultRenderReaction }
</script>

<script lang="ts">
	import { mergeProps } from 'bits-ui'
	import DefaultReactionTooltip from './DefaultReactionTooltip.svelte'
	import type { ReactionProps } from './reaction'

	/**
	 * A single emoji reaction pill with a count, highlighted when the user reacted. Hovering it shows a
	 * tooltip naming who reacted (the current user included), when `enableHoverList` is set.
	 * @public
	 */
	let {
		emoji,
		count,
		active,
		reactors,
		enableHoverList = true,
		renderReaction = defaultRenderReaction,
		ReactionTooltip = DefaultReactionTooltip,
		onClick,
	}: ReactionProps = $props()

	const className = $derived(
		active ? 'tlui-cmt-reaction tlui-cmt-reaction--active' : 'tlui-cmt-reaction'
	)
</script>

<!-- The default reaction renderer: emits the token string for the OS emoji font to draw. @public -->
{#snippet defaultRenderReaction(token: string)}{token}{/snippet}

{#snippet content()}
	<span class="tlui-cmt-reaction__emoji">{@render renderReaction(emoji)}</span>
	<span class="tlui-cmt-reaction__count">{count}</span>
{/snippet}

<!-- An inert pill (no handler) is plain content, not a control — rendering it as a span keeps it
     valid inside an anchor row (e.g. a notification list item) and out of the tab order. The
     emoji alone announces as its unicode name ("thumbs up"); pairing it with the count is what
     makes the pill's state legible to a screen reader. The inert span needs the img role for the
     label to be announced at all. -->
{#snippet pill({ props }: { props: Record<string, unknown> })}
	{#if onClick}
		<button
			{...mergeProps(props, { onclick: onClick })}
			class={className}
			type="button"
			aria-pressed={active}
			aria-label={`${emoji} ${count}`}
		>
			{@render content()}
		</button>
	{:else}
		<span {...props} class={className} role="img" aria-label={`${emoji} ${count}`}>
			{@render content()}
		</span>
	{/if}
{/snippet}

<!-- A bare pill when hovering is suppressed, or when there's no one to name. Otherwise hand the
     whole hover affordance to the tooltip component: it wraps the pill and owns how the reactor
     list is presented. -->
{#if !enableHoverList || reactors.length === 0}
	{@render pill({ props: {} })}
{:else}
	<ReactionTooltip {reactors}>
		{#snippet children({ props })}
			{@render pill({ props })}
		{/snippet}
	</ReactionTooltip>
{/if}
