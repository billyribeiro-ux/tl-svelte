import type { Component } from 'svelte'
import type { EmojiPickerProps } from './emoji-picker'
import type { RenderReaction } from './reaction'

/** @public */
export interface ReactionPickerProps {
	/** The emoji to offer. Defaults to `DEFAULT_REACTION_EMOJI`. */
	emoji?: string[]
	/** Emoji the current user has already reacted with; shown as pressed in the grid. */
	selected?: string[]
	/** Called when an emoji is chosen. */
	onSelect?(emoji: string): void
	/** How to draw each emoji token. Defaults to the token string (OS emoji font). */
	renderReaction?: RenderReaction
	/**
	 * What the button opens — the thing that produces a token. Defaults to `EmojiPicker`, the grid of
	 * emoji. Swap it for any component taking the same props to offer something else entirely (the
	 * drawn reactions example replaces it with a canvas you draw in); the props are passed straight
	 * through either way.
	 */
	palette?: Component<EmojiPickerProps>
	/**
	 * Identifies the menu in svelte-draw's global menu registry, which keys open/closed state by id.
	 * A thread renders one picker per comment, so this must differ per comment — sharing an id
	 * makes every picker in the thread open at once. Defaults to a per-instance generated id;
	 * pass one only for a stabler, more debuggable value.
	 */
	menuId?: string
	/** Class for the trigger button. Defaults to the card-action style, matching the ⋯ button. */
	class?: string
}

/**
 * Whether a palette pick asked to keep the palette open (shift held) for multi-select.
 * @internal
 */
export function isMultiSelectPick(event?: MouseEvent | KeyboardEvent): boolean {
	return !!event?.shiftKey
}
