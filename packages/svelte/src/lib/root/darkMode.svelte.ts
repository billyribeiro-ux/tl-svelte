import { debugFlags, type Editor } from '@svelte-draw/editor'
import { fromSignal } from '../state/fromSignal'
import { createColorMode } from './colorMode.svelte'

/**
 * Mirrors the editor's color mode and the `forceSrgb` debug flag onto the container's classes.
 * Replaces the `useDarkMode` hook. Call during component initialisation.
 */
export function setupDarkMode(
	editor: Editor,
	container: HTMLElement,
	getExportColorMode?: () => 'light' | 'dark' | null | undefined
) {
	const colorMode = createColorMode(editor, getExportColorMode)
	const forceSrgb = fromSignal(debugFlags.forceSrgb)

	$effect(() => {
		if (colorMode.current === 'dark') {
			container.setAttribute('data-color-mode', 'dark')
			container.classList.remove('tl-theme__light')
			container.classList.add('tl-theme__dark')
		} else {
			container.setAttribute('data-color-mode', 'light')
			container.classList.remove('tl-theme__dark')
			container.classList.add('tl-theme__light')
		}
		if (forceSrgb.current) {
			container.classList.add('tl-theme__force-sRGB')
		} else {
			container.classList.remove('tl-theme__force-sRGB')
		}
	})
}
