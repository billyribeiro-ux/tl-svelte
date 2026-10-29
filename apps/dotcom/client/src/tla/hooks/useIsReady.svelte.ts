import { getContext, setContext } from 'svelte'

/*
 * This file implements an optional 'shroud' for initial page loads to fade
 * in the page once all the necessary data has been loaded. This can help
 * avoid flickering in some situations. See `ReadyWrapper.svelte`.
 */

export interface ReadyState {
	readonly isReady: boolean
	setIsReady(): void
	readonly isRoot: boolean
}

const READY_KEY = Symbol('dotcom.ready')

/** The default, outside any `<ReadyWrapper>`: always ready, and the root. */
const defaultReady: ReadyState = { isReady: true, setIsReady: () => {}, isRoot: true }

export function setReadyState(state: ReadyState) {
	setContext(READY_KEY, state)
}

export function getReadyState(): ReadyState {
	return getContext<ReadyState | undefined>(READY_KEY) ?? defaultReady
}

export function getIsReady(): { readonly current: boolean } {
	const state = getReadyState()
	return {
		get current() {
			return state.isReady
		},
	}
}

export function getSetIsReady(): () => void {
	const state = getReadyState()
	return () => state.setIsReady()
}
