import {
	createTLCurrentUser,
	setUserPreferences as defaultSetUserPreferences,
	type TLCurrentUser,
	type TLUserPreferences,
} from '@svelte-draw/editor'
import { atom, computed, isSignal, type Signal } from '@svelte-draw/state'
import { untrack } from 'svelte'
import { shallowObjectIdentity } from './identity.svelte'

/**
 * Creates the editor's current user from preferences that may arrive later or change. Replaces the
 * `useSvelteDrawCurrentUser` hook. Call during component initialisation: it registers an effect.
 *
 * @public
 */
export function createSvelteDrawCurrentUser(
	getOptions: () => {
		userPreferences?: Signal<TLUserPreferences> | TLUserPreferences
		setUserPreferences?(userPreferences: TLUserPreferences): void
	}
): { readonly current: TLCurrentUser } {
	// the same signal `createTLCurrentUser()` defaults to
	const defaultUserPreferences = createTLCurrentUser().userPreferences
	const prefs = shallowObjectIdentity(() => getOptions().userPreferences ?? defaultUserPreferences)
	const setPreferences = $derived(getOptions().setUserPreferences)
	const userAtom = atom<TLUserPreferences | Signal<TLUserPreferences>>(
		'userAtom',
		untrack(() => prefs.current)
	)

	$effect(() => {
		userAtom.set(prefs.current)
	})

	const user = $derived.by(() => {
		const setUserPreferences = setPreferences
		return createTLCurrentUser({
			userPreferences: computed('userPreferences', () => {
				const userStuff = userAtom.get()
				return isSignal(userStuff) ? userStuff.get() : userStuff
			}),
			setUserPreferences: setUserPreferences ?? defaultSetUserPreferences,
		})
	})

	return {
		get current() {
			return user
		},
	}
}
