import { getContext, setContext } from 'svelte'
import { assertExists, atom, fromSignal, type Signal } from 'svelte-draw'
import type { SvelteDrawApp } from '../app/SvelteDrawApp'

/*
 * The app (the Zero-backed `SvelteDrawApp`) for signed-in users, as Svelte context.
 *
 * | React                          | Svelte                                   |
 * | ------------------------------ | ---------------------------------------- |
 * | `useMaybeApp()`                | `getMaybeApp().current` (`App \| null`)  |
 * | `useApp()`                     | `getApp().current` (throws if null)      |
 * | `useIsAppLoading()`            | `getIsAppLoading().current`              |
 * | `<AppStateProvider>`           | `<AppStateProvider>` (./AppStateProvider.svelte) |
 *
 * `.current` is tracked three ways: by Svelte (templates, `$derived`, `$effect`), by `@svelte-draw/state`
 * (inside `fromComputed` / `react` callbacks, so `fromComputed('x', () => app.current.getFile(id))`
 * recomputes when the app arrives or is replaced), and read plainly anywhere else.
 */

export const isClientTooOld$ = atom('isClientTooOld', false)

// The one source for the app; the context below is derived from it. Code that runs before
// the app exists but must pick it up without remounting (the presence user store behind the sync
// socket) reads this directly.
export const currentApp$ = atom<SvelteDrawApp | null>('currentApp', null)

export interface AppHolder<T> {
	readonly current: T
}

/** A holder that Svelte *and* the signals library can track. */
export function signalHolder<T>(signal: Signal<T>): AppHolder<T> {
	const view = fromSignal(signal)
	return {
		get current() {
			// Subscribes the Svelte reader; the value itself comes from `.get()` so that a reader inside
			// a signals `computed` captures `signal` as a dependency.
			void view.current
			return signal.get()
		},
	}
}

const APP_KEY = Symbol('dotcom.app')
const LOADING_KEY = Symbol('dotcom.app.loading')

const appHolder = signalHolder(currentApp$)
const loadingHolder: AppHolder<boolean> = {
	get current() {
		return appHolder.current === null
	},
}
const anonymousLoadingHolder: AppHolder<boolean> = { current: false }
const anonymousAppHolder: AppHolder<null> = { current: null }

/** Called by `<AppStateProvider>` during initialisation. */
export function setAppState() {
	setContext(APP_KEY, appHolder)
	setContext(LOADING_KEY, loadingHolder)
}

/**
 * The app, or `null` for a signed-out visitor, and for a signed-in user until Zero has preloaded.
 * Outside an `<AppStateProvider>` it is always `null`. Call during component initialisation.
 */
export function getMaybeApp(): AppHolder<SvelteDrawApp | null> {
	return getContext<AppHolder<SvelteDrawApp | null> | undefined>(APP_KEY) ?? anonymousAppHolder
}

/**
 * True between mount and the app resolving for a signed-in user. `getMaybeApp()` alone cannot tell
 * a signed-out visitor from a signed-in user whose Zero preload is still running. Anonymous trees
 * never mount the provider, so they read `false`.
 */
export function getIsAppLoading(): AppHolder<boolean> {
	return getContext<AppHolder<boolean> | undefined>(LOADING_KEY) ?? anonymousLoadingHolder
}

/**
 * The app. Reading `.current` while there is no app throws, as `useApp()` did on render: only call
 * this from components that are held back until the app exists (anything under `AppGate` apart
 * from the routes that opt in with `rendersWhileAppLoads`).
 */
export function getApp(): AppHolder<SvelteDrawApp> {
	const holder = getContext<AppHolder<SvelteDrawApp | null> | undefined>(APP_KEY)
	if (!holder) throw new Error('getApp must be used within AppStateProvider')
	return {
		get current() {
			return assertExists(holder.current, 'getApp must be used within AppStateProvider')
		},
	}
}
