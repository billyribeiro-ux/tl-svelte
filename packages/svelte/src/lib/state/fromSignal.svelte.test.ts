import { atom, transact } from '@svelte-draw/state'
import { flushSync } from 'svelte'
import { describe, expect, it } from 'vitest'
import { fromComputed, fromSignal } from './fromSignal'
import { quickReactor } from './reactor'

describe('fromSignal', () => {
	it('returns the current value outside of an effect', () => {
		const countAtom = atom('count', 1)
		const count = fromSignal(countAtom)
		expect(count.current).toBe(1)
		countAtom.set(2)
		expect(count.current).toBe(2)
	})

	it('re-runs a $derived when the signal changes', () => {
		const countAtom = atom('count', 1)
		const count = fromSignal(countAtom)
		const seen: number[] = []
		const cleanup = $effect.root(() => {
			const doubled = $derived(count.current * 2)
			$effect(() => {
				seen.push(doubled)
			})
		})
		flushSync()
		countAtom.set(5)
		flushSync()
		expect(seen).toEqual([2, 10])
		cleanup()
	})

	it('does not re-run effects for writes that do not change the value', () => {
		const countAtom = atom('count', 1)
		const count = fromSignal(countAtom)
		let runs = 0
		const cleanup = $effect.root(() => {
			$effect(() => {
				void count.current
				runs++
			})
		})
		flushSync()
		countAtom.set(1)
		flushSync()
		expect(runs).toBe(1)
		cleanup()
	})

	it('stops subscribing once the effect is destroyed', () => {
		const countAtom = atom('count', 1)
		const count = fromSignal(countAtom)
		let runs = 0
		const cleanup = $effect.root(() => {
			$effect(() => {
				void count.current
				runs++
			})
		})
		flushSync()
		cleanup()
		countAtom.set(2)
		flushSync()
		expect(runs).toBe(1)
	})

	it('batches transactions into a single update', () => {
		const aAtom = atom('a', 1)
		const bAtom = atom('b', 1)
		const sum = fromComputed('sum', () => aAtom.get() + bAtom.get())
		const seen: number[] = []
		const cleanup = $effect.root(() => {
			$effect(() => {
				seen.push(sum.current)
			})
		})
		flushSync()
		transact(() => {
			aAtom.set(2)
			bAtom.set(3)
		})
		flushSync()
		expect(seen).toEqual([2, 5])
		cleanup()
	})
})

describe('quickReactor', () => {
	it('runs immediately, re-runs on change, and stops when disposed', () => {
		const nAtom = atom('n', 1)
		const seen: number[] = []
		const stop = quickReactor('test', () => seen.push(nAtom.get()))
		nAtom.set(2)
		stop()
		nAtom.set(3)
		expect(seen).toEqual([1, 2])
	})
})
