import { flushSync } from 'svelte'
import { afterEach, describe, expect, it } from 'vitest'
import { createLocalStorageState } from './useLocalStorageState.svelte'

describe('createLocalStorageState', () => {
	afterEach(() => localStorage.clear())

	function make<T>(key: string, def: T) {
		let state!: ReturnType<typeof createLocalStorageState<T>>
		const cleanup = $effect.root(() => {
			state = createLocalStorageState<T>(key, def)
		})
		flushSync()
		return { state, cleanup }
	}

	it('starts with the default when nothing is stored', () => {
		const { state, cleanup } = make('k1', { a: 1 })
		expect(state.current).toEqual({ a: 1 })
		cleanup()
	})

	it('restores a stored value', () => {
		localStorage.setItem('k2', JSON.stringify({ a: 2 }))
		const { state, cleanup } = make('k2', { a: 1 })
		expect(state.current).toEqual({ a: 2 })
		cleanup()
	})

	it('keeps the default and logs when the stored value is not JSON', () => {
		localStorage.setItem('k3', '{nope')
		const { state, cleanup } = make('k3', 5)
		expect(state.current).toBe(5)
		cleanup()
	})

	it('persists values from update() with a value or an updater', () => {
		const { state, cleanup } = make('k4', 1)
		state.update(2)
		expect(state.current).toBe(2)
		state.update((n) => n + 1)
		expect(state.current).toBe(3)
		expect(localStorage.getItem('k4')).toBe('3')
		state.current = 9
		expect(localStorage.getItem('k4')).toBe('9')
		cleanup()
	})
})
