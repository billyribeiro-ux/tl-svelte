import type { Editor } from '@svelte-draw/editor'
import { Vec } from '@svelte-draw/editor'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToolbarVisibilityStateMachine } from './contextualToolbarState.svelte'
import { sufficientlyDistant } from './contextualToolbarUtils'

// The state machine only uses `editor.timers.setTimeout`.
const editor = {
	timers: { setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) },
} as unknown as Editor

beforeEach(() => {
	vi.useFakeTimers()
})
afterEach(() => {
	vi.useRealTimers()
})

describe('useToolbarVisibilityStateMachine', () => {
	it('starts hidden and off screen', () => {
		const m = useToolbarVisibilityStateMachine(() => false, undefined, editor)
		expect(m.isVisible).toBe(false)
		expect(m.isInteractive).toBe(false)
		expect(m.position).toEqual({ x: -1000, y: -1000 })
	})

	it('shows after the visibility timeout at the proposed position', () => {
		const m = useToolbarVisibilityStateMachine(() => false, undefined, editor)
		m.move(100, 200) // proposal only: hidden toolbars do not move
		m.show()
		expect(m.isVisible).toBe(false)
		vi.advanceTimersByTime(16)
		expect(m.isVisible).toBe(true)
		expect(m.isInteractive).toBe(true)
		expect(m.position).toEqual({ x: 100, y: 200 })
	})

	it('hides after a timeout, turning interactions off straight away', () => {
		const m = useToolbarVisibilityStateMachine(() => false, undefined, editor)
		m.show()
		vi.advanceTimersByTime(16)
		m.hide()
		expect(m.isInteractive).toBe(false)
		expect(m.isVisible).toBe(true)
		vi.advanceTimersByTime(16)
		expect(m.isVisible).toBe(false)
	})

	it('hides immediately when asked', () => {
		const m = useToolbarVisibilityStateMachine(() => false, undefined, editor)
		m.show()
		vi.advanceTimersByTime(16)
		m.hide(true)
		expect(m.isVisible).toBe(false)
		expect(m.isInteractive).toBe(false)
	})

	it('cancels a pending show when hidden first', () => {
		const m = useToolbarVisibilityStateMachine(() => false, undefined, editor)
		m.show()
		m.hide()
		vi.advanceTimersByTime(100)
		expect(m.isVisible).toBe(false)
	})

	it('comes back to shown immediately when shown again while hiding', () => {
		const m = useToolbarVisibilityStateMachine(() => false, undefined, editor)
		m.show()
		vi.advanceTimersByTime(16)
		m.hide()
		m.show()
		expect(m.isInteractive).toBe(true)
		vi.advanceTimersByTime(100)
		expect(m.isVisible).toBe(true)
	})

	it('moves after the move timeout, only when far enough from the current position', () => {
		const m = useToolbarVisibilityStateMachine(() => false, undefined, editor)
		m.move(0, 0)
		m.show()
		vi.advanceTimersByTime(16)

		m.move(5, 5) // < 16px away
		vi.advanceTimersByTime(150)
		expect(m.position).toEqual({ x: 0, y: 0 })

		m.move(50, 0)
		expect(m.position).toEqual({ x: 0, y: 0 })
		vi.advanceTimersByTime(150)
		expect(m.position).toEqual({ x: 50, y: 0 })
	})

	it('moves synchronously and reports it when asked to move immediately', () => {
		const seen: Array<{ x: number; y: number }> = []
		const m = useToolbarVisibilityStateMachine(
			() => false,
			(p) => seen.push(p),
			editor
		)
		m.move(0, 0)
		m.show()
		vi.advanceTimersByTime(16)

		m.move(100, 100, true)
		expect(m.position).toEqual({ x: 100, y: 100 })
		expect(seen).toEqual([{ x: 100, y: 100 }])
	})

	it('only repositions on y changes when changeOnlyWhenYChanges is set', () => {
		const m = useToolbarVisibilityStateMachine(() => true, undefined, editor)
		m.move(0, 0)
		m.show()
		vi.advanceTimersByTime(16)

		m.move(500, 2)
		vi.advanceTimersByTime(150)
		expect(m.position).toEqual({ x: 0, y: 0 })

		m.move(500, 40)
		vi.advanceTimersByTime(150)
		expect(m.position).toEqual({ x: 500, y: 40 })
	})
})

describe('sufficientlyDistant', () => {
	it('compares squared distance against 16px', () => {
		expect(sufficientlyDistant(new Vec(0, 0), new Vec(15, 0), false)).toBe(false)
		expect(sufficientlyDistant(new Vec(0, 0), new Vec(16, 0), false)).toBe(true)
		expect(sufficientlyDistant(new Vec(0, 0), new Vec(100, 15), true)).toBe(false)
	})
})
