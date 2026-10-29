import { getFromLocalStorage, setInLocalStorage } from '@svelte-draw/utils'

/**
 * A value mirrored in localStorage (replaces the React `useLocalStorageState` hook).
 *
 * The value starts as `defaultValue` so server and first client render agree; call `restore()` from
 * `onMount` / an `$effect` to read the stored value. `key` is a getter so the key can follow
 * reactive state such as the current pathname.
 */
export class LocalStorageState<T> {
	value = $state.raw<T>() as T
	#key: () => string

	constructor(key: () => string, defaultValue: T) {
		this.#key = key
		this.value = defaultValue
	}

	/** Reads the stored value for the current key, if there is one. Browser only. */
	restore(defaultValue?: T) {
		const stored = getFromLocalStorage(this.#key())
		if (stored) {
			try {
				this.value = JSON.parse(stored)
				return
			} catch {
				console.error(`Could not restore value ${this.#key()} from local storage.`)
			}
		}
		if (defaultValue !== undefined) this.value = defaultValue
	}

	set(next: T) {
		this.value = next
		setInLocalStorage(this.#key(), JSON.stringify(next))
	}
}
