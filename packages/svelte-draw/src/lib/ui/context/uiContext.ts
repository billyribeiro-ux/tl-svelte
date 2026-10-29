import { getContext, setContext } from 'svelte'

/**
 * A typed Svelte context slot. Replaces the `createContext` + `useContext` pairs of the React
 * providers. `tryGet` returns `null` outside a provider, `get` throws with the supplied message.
 *
 * @internal
 */
export function defineUiContext<T>(name: string) {
	const key = Symbol(name)
	return {
		set(value: T): T {
			setContext(key, value)
			return value
		},
		tryGet(): T | null {
			return getContext<T | undefined>(key) ?? null
		},
		get(errorMessage: string): T {
			const value = getContext<T | undefined>(key)
			if (value === undefined || value === null) throw new Error(errorMessage)
			return value
		},
	}
}
