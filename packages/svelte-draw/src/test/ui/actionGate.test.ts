import { createShapeId, Editor } from '@svelte-draw/editor'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { isActionRunnable } from '../../lib/ui/context/action-state'
import {
	gateActions,
	type TLUiActionItem,
	type TLUiActionsContextType,
} from '../../lib/ui/context/actions.svelte'
import type { TLUiOverrides } from '../../lib/ui/overrides.svelte'
import ActionCapturer from '../svelte/fixtures/ActionCapturer.svelte'
import { act, renderSvelteDraw, type RenderedSvelteDraw } from '../svelte/renderSvelteDraw'
import { TestEditor } from '../TestEditor'

let rendered: RenderedSvelteDraw | undefined
afterEach(() => {
	rendered?.unmount()
	rendered = undefined
})

const customOnSelect = vi.fn()

function withCustom(extra?: TLUiOverrides['actions']): TLUiOverrides {
	return {
		actions(editor, actions, helpers) {
			actions['custom'] = { id: 'custom', label: 'action.group', onSelect: customOnSelect }
			return extra ? extra(editor, actions, helpers) : actions
		},
	}
}

async function setup(overrides: TLUiOverrides = withCustom()) {
	let captured: TLUiActionsContextType = {}
	const onUiEvent = vi.fn()
	rendered = await renderSvelteDraw(
		{ overrides, onUiEvent },
		{
			waitForPatterns: false,
			child: ActionCapturer,
			childProps: {
				onCapture: (a: TLUiActionsContextType) => {
					captured = a
				},
			},
		}
	)
	const { editor } = rendered
	// A state where most actions would run: shapes selected in the select tool.
	act(() => {
		editor.createShapes([
			{ id: createShapeId('a'), type: 'geo', x: 0, y: 0 },
			{ id: createShapeId('b'), type: 'geo', x: 200, y: 0 },
			{ id: createShapeId('c'), type: 'geo', x: 400, y: 0 },
		])
		editor.selectAll()
	})
	customOnSelect.mockClear()
	return { editor, actions: () => captured, onUiEvent }
}

function watch(editor: Editor, onUiEvent: ReturnType<typeof vi.fn>) {
	let changes = 0
	const stop = editor.store.listen(() => changes++)
	const marks = vi.spyOn(editor, 'markHistoryStoppingPoint')
	onUiEvent.mockClear()
	customOnSelect.mockClear()
	return {
		expectNothingRan(id: string) {
			stop()
			expect({
				id,
				changes,
				marks: marks.mock.calls.length,
				events: onUiEvent.mock.calls.length,
				custom: customOnSelect.mock.calls.length,
			}).toEqual({ id, changes: 0, marks: 0, events: 0, custom: 0 })
			marks.mockRestore()
		},
	}
}

describe('isActionRunnable', () => {
	let editor: TestEditor
	beforeEach(() => {
		editor = new TestEditor()
	})
	const action = (partial: Partial<TLUiActionItem> = {}): TLUiActionItem => ({
		id: 'test',
		label: 'action.group',
		onSelect() {},
		...partial,
	})

	it('allows an action with no predicates and blocks a missing one', () => {
		expect(isActionRunnable(editor, action())).toBe(true)
		expect(isActionRunnable(editor, undefined)).toBe(false)
	})

	it('blocks when isAvailable or isEnabled returns false', () => {
		expect(isActionRunnable(editor, action({ isAvailable: () => false }))).toBe(false)
		expect(isActionRunnable(editor, action({ isEnabled: () => false }))).toBe(false)
	})

	it('blocks non-readonlyOk actions in readonly mode', () => {
		editor.updateInstanceState({ isReadonly: true })
		expect(isActionRunnable(editor, action())).toBe(false)
		expect(isActionRunnable(editor, action({ readonlyOk: true }))).toBe(true)
	})

	it.each(['isAvailable', 'isEnabled'] as const)(
		'blocks and reports once when %s throws',
		(predicate) => {
			const error = vi.spyOn(console, 'error').mockImplementation(() => {})
			const throwing = action({
				id: `throws-${predicate}`,
				[predicate]: () => {
					throw new Error('boom')
				},
			})
			expect(isActionRunnable(editor, throwing)).toBe(false)
			expect(isActionRunnable(editor, throwing)).toBe(false)
			expect(error).toHaveBeenCalledTimes(1)
			error.mockRestore()
		}
	)

	it('ignores isChecked, even when it throws', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {})
		const checked = action({
			isChecked: () => {
				throw new Error('boom')
			},
		})
		expect(isActionRunnable(editor, checked)).toBe(true)
		expect(error).not.toHaveBeenCalled()
		error.mockRestore()
	})
})

describe('gateActions', () => {
	it('returns new objects and leaves the input untouched', () => {
		const editor = new TestEditor()
		const raw = vi.fn()
		const constant: TLUiActionItem = { id: 'c', label: 'action.group', onSelect: raw }
		const gated = gateActions(editor, { c: constant })
		gateActions(editor, { c: constant })
		// Mutating the input is what would stack wrappers across memo reruns.
		expect(constant.onSelect).toBe(raw)
		expect(gated.c).not.toBe(constant)
	})

	it('gates on the action under its key, whatever object onSelect is called on', () => {
		const editor = new TestEditor()
		const disabled = vi.fn()
		const readonlyOk = vi.fn()
		const gated = gateActions(editor, {
			d: { id: 'd', label: 'action.group', isEnabled: () => false, onSelect: disabled },
			r: { id: 'r', label: 'action.group', readonlyOk: true, onSelect: readonlyOk },
		})
		gated.d.onSelect.call({ id: 'x' } as any, 'unknown')
		;({ ...gated.d, isEnabled: () => true }).onSelect('unknown')
		;({ id: 'd', onSelect: gated.d.onSelect }).onSelect('unknown')
		expect(disabled).not.toHaveBeenCalled()

		editor.updateInstanceState({ isReadonly: true })
		;({ id: 'r', onSelect: gated.r.onSelect }).onSelect('unknown')
		expect(readonlyOk).toHaveBeenCalledTimes(1)
	})
})

describe('every action gates itself', () => {
	// Importing TestEditor installs fake timers, which stall rendering a real <SvelteDraw />.
	beforeEach(() => {
		vi.useRealTimers()
	})
	afterEach(() => {
		vi.useFakeTimers()
	})

	it('blocks every action an override disables', async () => {
		const { editor, actions, onUiEvent } = await setup(
			withCustom((_editor, actions) => {
				for (const [id, action] of Object.entries(actions)) {
					actions[id] = { ...action, isEnabled: () => false }
				}
				return actions
			})
		)
		expect(Object.keys(actions()).length).toBeGreaterThan(50)
		for (const [id, action] of Object.entries(actions())) {
			const w = watch(editor, onUiEvent)
			await act(async () => {
				await action.onSelect('unknown')
			})
			w.expectNothingRan(id)
		}
	})
})
