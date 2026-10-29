import { getFromLocalStorage, setInLocalStorage } from 'svelte-draw'

const STORAGE_KEY = 'shader-selected'

function restore(): string {
	const stored = getFromLocalStorage(STORAGE_KEY)
	if (stored) {
		try {
			return JSON.parse(stored)
		} catch {
			console.error(`Could not restore value ${STORAGE_KEY} from local storage.`)
		}
	}
	return 'fluid'
}

/**
 * Which example is showing. Shared by the page (which picks the `Background` renderer) and the
 * style panel (which lists the examples), so it lives in a module rather than in a component.
 * Persisted in local storage under the same key and format the React template used.
 */
let selected = $state.raw(restore())

export const selectedExample = {
	get current() {
		return selected
	},
	select(value: string) {
		selected = value
		setInLocalStorage(STORAGE_KEY, JSON.stringify(value))
	},
}
