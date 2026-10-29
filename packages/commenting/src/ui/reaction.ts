import type { Component, Snippet } from 'svelte'
import type { ReactionReactor } from './reactions'

/**
 * Render a reaction token to its visual — the emoji glyph by default. A snippet taking the token
 * string. @public
 */
export type RenderReaction = Snippet<[string]>

/** @public */
export interface ReactionProps {
	emoji: string
	count: number
	active: boolean
	/** How to draw the emoji token. Defaults to the token string (OS emoji font). */
	renderReaction?: RenderReaction
	/** Who reacted with this emoji, in reaction order — shown when the pill is hovered. */
	reactors: ReactionReactor[]
	/** Whether hovering shows the reactor list. Pass false to suppress it — e.g. while another
	 *  popup menu on the comment is open. Defaults to true. */
	enableHoverList?: boolean
	/** The hover affordance for the pill, naming who reacted. It receives the reactors and the pill
	 *  itself (as the `children` snippet) and returns the whole thing — so it owns the tooltip, its
	 *  box, size, shape, and position, not just the text inside. Defaults to
	 *  `DefaultReactionTooltip`, which hangs the built-in inline sentence below the pill. */
	ReactionTooltip?: Component<ReactionTooltipProps>
	/** Called when the pill is pressed — toggles the current user's reaction. */
	onClick?(): void
}

/** @public */
export interface ReactionTooltipProps {
	/** Who reacted with this emoji, in reaction order. */
	reactors: ReactionReactor[]
	/**
	 * The reaction pill to wrap. Anchor the hover affordance to this and render it: the snippet
	 * takes the trigger `props` to spread onto the element that should trigger the tooltip (the
	 * same contract as `SvelteDrawUiTooltip`'s `child`).
	 */
	children: Snippet<[{ props: Record<string, unknown> }]>
}
