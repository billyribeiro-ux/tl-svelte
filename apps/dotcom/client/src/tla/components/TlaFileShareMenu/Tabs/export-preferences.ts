import type { Editor } from 'svelte-draw'
import type { SvelteDrawApp } from '../../../app/SvelteDrawApp'
import { getLocalSessionState, type SvelteDrawAppSessionState } from '../../../utils/local-session-state'

export function getImageExportOptions(
	editor: Editor,
	{
		exportPadding,
		exportBackground,
		exportTheme,
	}: SvelteDrawAppSessionState['exportSettings']
) {
	return {
		padding: exportPadding ? editor.options.defaultSvgPadding : ('auto' as const),
		background: exportBackground,
		darkMode: exportTheme === 'auto' ? undefined : exportTheme === 'dark',
	}
}

export function getExportPreferences(app: SvelteDrawApp | null) {
	const sessionState = getLocalSessionState()

	let { exportPadding, exportBackground, exportTheme, exportFormat } = sessionState.exportSettings

	if (app && sessionState.auth) {
		const user = app.getUser()
		if (user) {
			exportPadding = user.exportPadding
			exportBackground = user.exportBackground
			exportTheme = user.exportTheme
			exportFormat = user.exportFormat
		}
	}

	return {
		exportPadding,
		exportBackground,
		exportTheme,
		exportFormat,
	}
}
