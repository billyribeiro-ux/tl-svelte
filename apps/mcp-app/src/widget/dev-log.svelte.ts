const MAX_DEV_LOG_ENTRIES = 200
export const DEV_LOG_PANEL_HEIGHT = 140
export const DEV_LOG_PANEL_GAP = 8

export function createDevLog() {
	let isDev = $state(false)
	let isDevLogVisible = $state(false)
	let devLogEntries = $state.raw<string[]>([])
	// Read synchronously by `logIfDevMode`; the `$state` above only drives the UI.
	let isDevFlag = false

	function logIfDevMode(message: string) {
		if (!isDevFlag) return
		const timestamp = new Date().toLocaleTimeString()
		devLogEntries = [...devLogEntries, `[${timestamp}] ${message}`].slice(-MAX_DEV_LOG_ENTRIES)
	}

	function toggleDevLog() {
		isDevLogVisible = !isDevLogVisible
	}

	function enableDevMode() {
		isDevFlag = true
		isDev = true
		isDevLogVisible = true
	}

	return {
		get isDev() {
			return isDev
		},
		get isDevLogVisible() {
			return isDevLogVisible
		},
		get devLogEntries() {
			return devLogEntries
		},
		logIfDevMode,
		toggleDevLog,
		enableDevMode,
	}
}
