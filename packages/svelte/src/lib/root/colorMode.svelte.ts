import type { Editor } from '@svelte-draw/editor'
import { fromComputed, type SignalValue } from '../state/fromSignal'

/**
 * The editor's effective color mode. When an SVG export is rendering, the export's color mode wins
 * over the editor's. Replaces the `useColorMode` hook.
 *
 * @param getExportColorMode - returns the color mode of the surrounding SVG export, if any.
 *
 * @public
 */
export function createColorMode(
	editor: Editor,
	getExportColorMode?: () => 'light' | 'dark' | null | undefined
): SignalValue<'light' | 'dark'> {
	return fromComputed('colorMode', () => {
		const exportColorMode = getExportColorMode?.()
		if (exportColorMode) return exportColorMode
		return editor.getColorMode()
	})
}
