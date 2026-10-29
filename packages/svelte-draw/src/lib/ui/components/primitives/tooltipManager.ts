import type { Snippet } from 'svelte'
import { atom, tlenvReactive, type Editor } from '@svelte-draw/editor'

/** @public */
export type TLUiTooltipContent = string | Snippet

export interface TooltipData {
	id: string
	content: TLUiTooltipContent
	side: 'top' | 'right' | 'bottom' | 'left'
	sideOffset: number
	showOnMobile: boolean
	targetElement: HTMLElement
	delayDuration: number
}

// State machine states
type TooltipState =
	| { name: 'idle' }
	| { name: 'pointer_down' }
	| { name: 'showing'; tooltip: TooltipData }
	| { name: 'waiting_to_hide'; tooltip: TooltipData; timeoutId: number }

// State machine events
export type TooltipEvent =
	| { type: 'pointer_down' }
	| { type: 'pointer_up' }
	| { type: 'show'; tooltip: TooltipData }
	| { type: 'hide'; tooltipId: string; editor: Editor | null; instant: boolean }
	| { type: 'hide_all' }

// Singleton tooltip manager using explicit state machine
export class TooltipManager {
	private state = atom<TooltipState>('tooltip state', { name: 'idle' })

	hideAllTooltips() {
		this.handleEvent({ type: 'hide_all' })
	}

	handleEvent(event: TooltipEvent) {
		const currentState = this.state.get()

		switch (event.type) {
			case 'pointer_down': {
				// Transition to pointer_down from any state
				if (currentState.name === 'waiting_to_hide') {
					clearTimeout(currentState.timeoutId)
				}
				this.state.set({ name: 'pointer_down' })
				break
			}

			case 'pointer_up': {
				// Only transition from pointer_down to idle
				if (currentState.name === 'pointer_down') {
					this.state.set({ name: 'idle' })
				}
				break
			}

			case 'show': {
				// Don't show tooltips while pointer is down
				if (currentState.name === 'pointer_down') {
					return
				}

				// Clear any existing timeout if transitioning from waiting_to_hide
				if (currentState.name === 'waiting_to_hide') {
					clearTimeout(currentState.timeoutId)
				}

				// Transition to showing state
				this.state.set({ name: 'showing', tooltip: event.tooltip })
				break
			}

			case 'hide': {
				const { tooltipId, editor, instant } = event

				// Only hide if the tooltip matches
				if (currentState.name === 'showing' && currentState.tooltip.id === tooltipId) {
					if (editor && !instant) {
						// Transition to waiting_to_hide state
						const timeoutId = editor.timers.setTimeout(() => {
							const state = this.state.get()
							if (state.name === 'waiting_to_hide' && state.tooltip.id === tooltipId) {
								this.state.set({ name: 'idle' })
							}
						}, 300)
						this.state.set({
							name: 'waiting_to_hide',
							tooltip: currentState.tooltip,
							timeoutId,
						})
					} else {
						this.state.set({ name: 'idle' })
					}
				} else if (
					currentState.name === 'waiting_to_hide' &&
					currentState.tooltip.id === tooltipId
				) {
					// Already waiting to hide, make it instant if requested
					if (instant) {
						clearTimeout(currentState.timeoutId)
						this.state.set({ name: 'idle' })
					}
				}
				break
			}

			case 'hide_all': {
				if (currentState.name === 'waiting_to_hide') {
					clearTimeout(currentState.timeoutId)
				}
				// Preserve pointer_down state if that's the current state
				if (currentState.name === 'pointer_down') {
					return
				}
				this.state.set({ name: 'idle' })
				break
			}
		}
	}

	getCurrentTooltipData(): TooltipData | null {
		const currentState = this.state.get()
		if (currentState.name !== 'showing' && currentState.name !== 'waiting_to_hide') return null
		const { tooltip } = currentState
		if (tlenvReactive.get().isCoarsePointer && !tooltip.showOnMobile) return null
		return tooltip
	}
}

export const tooltipManager = new TooltipManager()

/** @public */
export function hideAllTooltips() {
	tooltipManager.hideAllTooltips()
}
