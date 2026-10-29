import { Signal, atom, computed, isSignal } from '@svelte-draw/state'
import { areObjectsShallowEqual } from '@svelte-draw/utils'
import { TLUserPreferences, getUserPreferences, setUserPreferences } from './TLUserPreferences'

/** @public */
export interface TLCurrentUser {
	readonly userPreferences: Signal<TLUserPreferences>
	// eslint-disable-next-line svelte-draw/method-signature-style
	readonly setUserPreferences: (userPreferences: TLUserPreferences) => void
}

const defaultLocalStorageUserPrefs = computed('defaultLocalStorageUserPrefs', () =>
	getUserPreferences()
)

/** @public */
export function createTLCurrentUser(
	opts = {} as {
		userPreferences?: Signal<TLUserPreferences>
		// eslint-disable-next-line svelte-draw/method-signature-style
		setUserPreferences?: (userPreferences: TLUserPreferences) => void
	}
): TLCurrentUser {
	return {
		userPreferences: opts.userPreferences ?? defaultLocalStorageUserPrefs,
		setUserPreferences: opts.setUserPreferences ?? setUserPreferences,
	}
}

/** @public */
export interface TLReactiveCurrentUser extends TLCurrentUser {
	/**
	 * Point the user at new preferences (a plain value or a signal). Shallow-equal values are
	 * ignored so a host that re-passes a fresh-but-equal object on every update does not
	 * invalidate the user's `userPreferences` signal.
	 */
	// eslint-disable-next-line svelte-draw/method-signature-style
	readonly update: (userPreferences?: Signal<TLUserPreferences> | TLUserPreferences) => void
}

/**
 * Framework-neutral replacement for the old `useSvelteDrawCurrentUser` hook. The returned user is
 * stable for its lifetime; call `update` whenever the host's preferences input changes.
 *
 * @public
 */
export function createReactiveTLCurrentUser(opts: {
	userPreferences?: Signal<TLUserPreferences> | TLUserPreferences
	// eslint-disable-next-line svelte-draw/method-signature-style
	setUserPreferences?: (userPreferences: TLUserPreferences) => void
}): TLReactiveCurrentUser {
	let prefs = opts.userPreferences ?? defaultLocalStorageUserPrefs
	const userAtom = atom<TLUserPreferences | Signal<TLUserPreferences>>('userAtom', prefs)

	const user = createTLCurrentUser({
		userPreferences: computed('userPreferences', () => {
			const userStuff = userAtom.get()
			return isSignal(userStuff) ? userStuff.get() : userStuff
		}),
		setUserPreferences: opts.setUserPreferences,
	})

	return {
		...user,
		update(next) {
			const incoming = next ?? defaultLocalStorageUserPrefs
			if (incoming === prefs || areObjectsShallowEqual(incoming, prefs)) return
			prefs = incoming
			userAtom.set(incoming)
		},
	}
}
