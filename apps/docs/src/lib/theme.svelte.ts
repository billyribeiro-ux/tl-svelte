import { browser } from '$app/env'

/**
 * A small theme store replacing `next-themes`.
 *
 * Mirrors the `ThemeProvider` configuration the Next app used: `attribute="class"`,
 * `defaultTheme="light"`, `enableSystem={false}`, persisted under the `theme` localStorage key,
 * with `color-scheme` kept in sync. The inline script in `src/app.html` applies the stored theme
 * before first paint (what next-themes' injected script did), so there is no flash.
 */
export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme'
export const DEFAULT_THEME: Theme = 'light'

function isTheme(value: unknown): value is Theme {
	return value === 'light' || value === 'dark'
}

function readStoredTheme(): Theme {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY)
		if (isTheme(stored)) return stored
	} catch {
		// localStorage can be unavailable (private mode, blocked storage); fall back to the default.
	}
	return DEFAULT_THEME
}

function applyTheme(theme: Theme) {
	const root = document.documentElement
	root.classList.remove('light', 'dark')
	root.classList.add(theme)
	root.style.colorScheme = theme
}

class ThemeStore {
	/** `undefined` until the client has read the stored theme, so server and first client render match. */
	current = $state<Theme | undefined>(undefined)

	/** Reads the stored theme and starts syncing across tabs. Returns the cleanup function. */
	init(): () => void {
		if (!browser) return () => {}
		this.current = readStoredTheme()
		const onStorage = (event: StorageEvent) => {
			if (event.key !== THEME_STORAGE_KEY) return
			const next = isTheme(event.newValue) ? event.newValue : DEFAULT_THEME
			this.current = next
			applyTheme(next)
		}
		window.addEventListener('storage', onStorage)
		return () => window.removeEventListener('storage', onStorage)
	}

	set(theme: Theme) {
		this.current = theme
		applyTheme(theme)
		try {
			localStorage.setItem(THEME_STORAGE_KEY, theme)
		} catch {
			// Not persisted; the theme still applies for this page view.
		}
	}

	toggle() {
		this.set(this.current === 'light' ? 'dark' : 'light')
	}
}

export const theme = new ThemeStore()
