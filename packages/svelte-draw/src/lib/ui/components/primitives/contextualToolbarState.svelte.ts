import { Vec, type Editor } from '@svelte-draw/editor'
import { getEditor } from '@svelte-draw/svelte'
import { sufficientlyDistant } from './contextualToolbarUtils'

const MOVE_TIMEOUT = 150
const HIDE_VISIBILITY_TIMEOUT = 16
const SHOW_VISIBILITY_TIMEOUT = 16

/** @public */
export interface ToolbarVisibilityStateMachine {
	/** The toolbar is visible in the 'shown' and 'hiding' states */
	readonly isVisible: boolean
	/** The toolbar should only be interactive when in the 'shown' state */
	readonly isInteractive: boolean
	/** The position is updated when entering the 'shown' state or when moving while in the 'shown' state */
	readonly position: { x: number; y: number }
	show(): void
	hide(immediate?: boolean): void
	move(x: number, y: number, immediate?: boolean): void
}

/**
 * Replaces the React `useToolbarVisibilityStateMachine` hook. Call during component initialisation
 * (it reads the editor from context).
 *
 * @param getChangeOnlyWhenYChanges read through a getter so it follows a reactive prop.
 * @param onImmediatePosition called synchronously when `move(..., true)` commits a position. React
 *   used `flushSync` to land the DOM update in the same tick; calling this is the Svelte equivalent
 *   (flushSync is not allowed to run inside an effect, where this machine is driven from).
 *
 * @public
 */
export function useToolbarVisibilityStateMachine(
	getChangeOnlyWhenYChanges: () => boolean,
	onImmediatePosition?: (position: { x: number; y: number }) => void,
	editorOverride?: Editor
): ToolbarVisibilityStateMachine {
	const editor = editorOverride ?? getEditor()

	let state: { name: 'hidden' } | { name: 'showing' } | { name: 'shown' } | { name: 'hiding' } = {
		name: 'hidden',
	}

	// The toolbar should only be interactive when in the 'shown' state
	let isInteractive = $state(false)

	// The toolbar is visible in the 'shown' and 'hiding' states
	let isVisible = $state(false)

	// The position is updated when entering the 'shown' state or when moving while in the 'shown' state
	let position = $state.raw({ x: -1000, y: -1000 })

	// The toolbar's current position
	let currPosition = new Vec(-1000, -1000)

	// The toolbar's proposed next position
	const nextPosition = new Vec(-1000, -1000)

	// A timeout needs to be completed before the toolbar is shown or hidden
	let stableVisibilityTimeout: any = -1

	// A timeout needs to be completed before the toolbar's position changes moved
	let stablePositionTimeout: any = -1

	/**
	 * Send the 'move' event whenever something happens that would cause the toolbar's position to change.
	 * If the state is 'shown', it will start a new timeout that will update the toolbar's position after it completes.
	 */
	function move(x: number, y: number, immediate = false) {
		// Update the next proposed position
		nextPosition.x = x
		nextPosition.y = y

		// If the toolbar is not yet visible, don't do anything
		if (state.name === 'hidden' || state.name === 'showing') return

		// If showing or hiding, cancel the position timeout and start a new one.
		// When the timeout ends, if we're in the 'shown' state and the position has changed sufficiently
		// from the last visible position, update the position.
		clearTimeout(stablePositionTimeout)

		const flushMove = () => {
			if (
				state.name === 'shown' &&
				sufficientlyDistant(nextPosition, currPosition, getChangeOnlyWhenYChanges())
			) {
				const { x, y } = nextPosition
				currPosition = new Vec(x, y)
				position = { x, y }
				if (immediate) {
					onImmediatePosition?.(position)
				}
			}
		}

		if (immediate) {
			flushMove()
		} else {
			stablePositionTimeout = editor.timers.setTimeout(flushMove, MOVE_TIMEOUT)
		}
	}

	/**
	 * Send the hide event whenever a change occurs that would cause the toolbar to become invisible.
	 * If the state is 'shown', it will enter 'hiding' and then 'hidden' after a timeout completes.
	 * If the state is 'showing', it will cancel the visibility timeout and enter 'hidden' immediately.
	 */
	function hide(immediate = false) {
		switch (state.name) {
			case 'showing': {
				clearTimeout(stableVisibilityTimeout)
				state = { name: 'hidden' }
				break
			}
			case 'shown': {
				state = { name: 'hiding' }
				isInteractive = false // when leaving shown, turn back on interactions

				if (immediate) {
					state = { name: 'hidden' }
					isVisible = false
				} else {
					stableVisibilityTimeout = editor.timers.setTimeout(() => {
						state = { name: 'hidden' }
						isVisible = false
					}, HIDE_VISIBILITY_TIMEOUT)
				}
				break
			}
			default: {
				// noop
			}
		}
	}

	/**
	 * Send the show event whenever a change occurs that would cause the toolbar to become visible.
	 * If the state is 'hidden', it will enter 'showing' and then 'shown' after a timeout completes.
	 * If the state is 'hiding', it will cancel the visibility timeout and enter 'shown' immediately.
	 */
	function show() {
		switch (state.name) {
			case 'hidden': {
				state = { name: 'showing' }
				stableVisibilityTimeout = editor.timers.setTimeout(() => {
					// position
					const { x, y } = nextPosition
					currPosition = new Vec(x, y)
					position = { x, y }

					state = { name: 'shown' }
					isVisible = true
					isInteractive = true
				}, SHOW_VISIBILITY_TIMEOUT)
				break
			}
			case 'hiding': {
				// Go back to shown immediately
				clearTimeout(stableVisibilityTimeout)
				state = { name: 'shown' }
				isInteractive = true // when entering shown, turn back on interactions
				move(nextPosition.x, nextPosition.y)
				break
			}
			default: {
				// noop
			}
		}
	}

	return {
		get isVisible() {
			return isVisible
		},
		get isInteractive() {
			return isInteractive
		},
		get position() {
			return position
		},
		show,
		hide,
		move,
	}
}
