import { getFromLocalStorage, setInLocalStorage } from '@svelte-draw/editor'

/**
 * State persisted in local storage under `key`. The stored value is restored in `$effect.pre` (the
 * counterpart of React's layout effect) so it is in place before the first paint; until then
 * `current` is `defaultValue`. `key` may be a getter. Call during component initialisation.
 * Replaces `useLocalStorageState`.
 *
 * `current` can be assigned; `update` also accepts an updater function like React's `setState`.
 *
 * @public
 */
export function createLocalStorageState<T = any>(
	key: string | (() => string),
	defaultValue: T
): { current: T; update(setter: T | ((value: T) => T)): void } {
	const getKey = typeof key === 'function' ? key : () => key
	let state = $state.raw<T>(defaultValue)

	$effect.pre(() => {
		const k = getKey()
		const value = getFromLocalStorage(k)
		if (value) {
			try {
				state = JSON.parse(value)
			} catch {
				console.error(`Could not restore value ${k} from local storage.`)
			}
		}
	})

	function update(setter: T | ((value: T) => T)) {
		const value = typeof setter === 'function' ? (setter as (value: T) => T)(state) : setter
		state = value
		setInLocalStorage(getKey(), JSON.stringify(value))
	}

	return {
		get current() {
			return state
		},
		set current(value: T) {
			update(value)
		},
		update,
	}
}
