import { fromComputed, react, type TLThemeId } from 'svelte-draw'
import { globalEditor } from '../../utils/globalEditor'
import { UI_THEMES, type UIThemeVariant } from '../themes/ui-themes'
import {
	getColorThemePreview,
	getLocalSessionState,
	updateLocalSessionState,
} from '../utils/local-session-state'

const registeredFor = new WeakSet<object>()

function ensureThemesRegistered(editor: ReturnType<typeof globalEditor.get>) {
	if (!editor || registeredFor.has(editor)) return
	registeredFor.add(editor)
	for (const { theme } of UI_THEMES) {
		editor.updateTheme(theme)
	}
}

function applyProps(el: HTMLElement, props: Record<string, string>) {
	for (const [key, value] of Object.entries(props)) {
		el.style.setProperty(`--${key}`, value)
	}
}

function clearProps(el: HTMLElement, keys: string[]) {
	for (const key of keys) {
		el.style.removeProperty(`--${key}`)
	}
}

/**
 * Syncs the user's selected UI color theme from local session state to two
 * places:
 *
 * 1. The editor's `ThemeManager` — so canvas rendering (shapes, indicators,
 *    overlays) picks up theme colors.
 * 2. Inline CSS variable overrides on `.tla-theme-container` and any inner
 *    `.tl-container` — so the app chrome (sidebar, panels, buttons) retints
 *    without waiting on a CSS refactor.
 *
 * Also caches the current theme's background color into localStorage so that
 * `theme-init.js` can avoid a flash of the default background on next load.
 */
export function setupUITheme() {
	const selectedColorTheme = fromComputed('colorTheme', () => getLocalSessionState().colorTheme)
	const previewColorTheme = fromComputed('colorThemePreview', () => getColorThemePreview())
	const colorTheme = $derived(previewColorTheme.current ?? selectedColorTheme.current)
	const theme = fromComputed('theme', () => getLocalSessionState().theme)

	// Apply CSS variable overrides to the tla shell + editor containers.
	$effect(() => {
		const container = document.querySelector('.tla-theme-container') as HTMLElement | null
		if (!container) return

		const entry = UI_THEMES.find((t) => t.id === colorTheme)
		if (!entry) return

		const variant: UIThemeVariant = theme.current === 'dark' ? entry.dark : entry.light
		const props = { ...variant.tl, ...variant.tla }
		const keys = Object.keys(props)

		const touched = new Set<HTMLElement>()
		const apply = (el: HTMLElement) => {
			applyProps(el, props)
			touched.add(el)
		}

		apply(container)
		for (const el of container.querySelectorAll<HTMLElement>('.tl-container')) {
			apply(el)
		}

		const observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				for (const node of mutation.addedNodes) {
					if (!(node instanceof HTMLElement)) continue
					if (node.classList.contains('tl-container')) apply(node)
					for (const el of node.querySelectorAll<HTMLElement>('.tl-container')) {
						apply(el)
					}
				}
			}
		})
		observer.observe(container, { childList: true, subtree: true })

		return () => {
			observer.disconnect()
			for (const el of touched) {
				clearProps(el, keys)
			}
		}
	})

	// Sync to the editor's ThemeManager so canvas colors follow the theme.
	$effect(() => {
		const colorThemeValue = colorTheme
		const preview = previewColorTheme.current
		return react('apply colorTheme to editor', () => {
			const editor = globalEditor.get()
			if (!editor) return

			ensureThemesRegistered(editor)

			const themes = editor.getThemes()
			const nextId = (colorThemeValue in themes ? colorThemeValue : 'default') as TLThemeId
			if (editor.getCurrentThemeId() !== nextId) {
				editor.setCurrentTheme(nextId)
			}

			if (!preview) {
				// Keep the cached background color in sync for the flash-prevention
				// script. Default theme is treated as "no cache" so the script falls
				// back to its built-in light/dark values.
				const colorMode = editor.getColorMode()
				const background = editor.getCurrentTheme().colors[colorMode].background
				const cachedBackground = nextId === 'default' ? undefined : background
				if (getLocalSessionState().colorThemeBackground !== cachedBackground) {
					updateLocalSessionState(() => ({ colorThemeBackground: cachedBackground }))
				}
			}
		})
	})
}
