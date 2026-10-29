export interface ClipboardLog {
	action: string
	source: string
	prevented: boolean
	detail?: string
}

export interface ClipboardEventsState {
	disableCopy: boolean
	disablePaste: boolean
	filterRedOnCopy: boolean
	filterRedOnPaste: boolean
	handleRawPaste: boolean
	useAsyncCallbacks: boolean
	log: ClipboardLog[]
}

// [1]
export const state: ClipboardEventsState = $state({
	disableCopy: false,
	disablePaste: false,
	filterRedOnCopy: false,
	filterRedOnPaste: false,
	handleRawPaste: false,
	useAsyncCallbacks: false,
	log: [],
})

export function updateState(patch: Partial<ClipboardEventsState>) {
	Object.assign(state, patch)
}

export function addLog(entry: ClipboardLog) {
	updateState({ log: [entry, ...state.log].slice(0, 3) })
	;(window as any).__svelteDraw_clipboard_log = [
		...((window as any).__svelteDraw_clipboard_log ?? []),
		entry,
	]
}

// [3]
;(window as any).__svelteDraw_clipboard_state = state
;(window as any).__svelteDraw_clipboard_updateState = updateState
