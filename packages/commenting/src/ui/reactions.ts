import type { Component } from 'svelte'
import type { ReactionTooltipProps, RenderReaction } from './reaction'

/** One person who reacted with a given emoji, for the hover list. @public */
export interface ReactionReactor {
	/** Display name of the person who reacted. */
	name: string
	/** True for the current user. */
	you: boolean
}

/** One emoji's reactions on a comment, already tallied. @public */
export interface ReactionSummary {
	emoji: string
	/** How many people reacted with this emoji. */
	count: number
	/** True when the current user is one of them — renders the pill highlighted. */
	active: boolean
	/** Who reacted with this emoji, in reaction order — shown in the hover list. */
	reactors: ReactionReactor[]
}

/** @public */
export interface ReactionsProps {
	/** The comment's reactions, grouped by emoji. Empty renders nothing. */
	reactions: ReactionSummary[]
	/** Toggles the current user's reaction for an emoji. */
	onToggle?(emoji: string): void
	/** Whether the current user may react. False makes the pills inert (e.g. a signed-out
	 *  viewer, or a read-only thread) while still showing counts. */
	canReact?: boolean
	/** Whether hovering a pill shows its reactor list. Pass false to suppress it — e.g. while
	 *  another popup menu on the comment is open. Defaults to true. */
	enableHoverList?: boolean
	/** How to draw each emoji token. Defaults to the token string (OS emoji font). */
	renderReaction?: RenderReaction
	/** The tooltip naming who reacted, shown when a pill is hovered. Defaults to an inline sentence
	 *  (`DefaultReactionTooltip`). Swap it to render the reactor list however you like. */
	ReactionTooltip?: Component<ReactionTooltipProps>
}
