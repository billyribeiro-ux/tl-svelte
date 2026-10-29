import { createShapeId } from '@svelte-draw/editor'
import { afterEach, describe, expect, it } from 'vitest'
import { ARRANGE_ACTIONS, EDIT_ACTIONS, REORDER_ACTIONS } from '../../lib/ui/components/menu-items'
import type { TLUiActionsContextType } from '../../lib/ui/context/actions.svelte'
import type { TLUiOverrides } from '../../lib/ui/overrides.svelte'
import SomeActionsEnabledProbe from '../svelte/fixtures/SomeActionsEnabledProbe.svelte'
import SubmenusHost from '../svelte/fixtures/SubmenusHost.svelte'
import { act, renderSvelteDraw, screen, type RenderedSvelteDraw } from '../svelte/renderSvelteDraw'

let rendered: RenderedSvelteDraw | undefined
afterEach(() => rendered?.unmount())

// The keyboard-shortcuts menu type renders submenu children inline, so an item that renders
// shows up by test id without opening a bits-ui submenu.
async function setup(overrides: TLUiOverrides) {
	rendered = await renderSvelteDraw(
		{ overrides, components: { QuickActions: null } },
		{ waitForPatterns: false, child: SubmenusHost }
	)
	const { editor } = rendered
	act(() => {
		editor.createShapes([
			{ id: createShapeId('a'), type: 'geo' },
			{ id: createShapeId('b'), type: 'geo', x: 200 },
		])
	})
	return editor
}

const row = (id: string) => screen.queryByTestId(`kbd.${id}`)

describe('context menu submenus', () => {
	it('stay hidden with nothing selected when an action is replaced without isEnabled', async () => {
		const replaced = ['toggle-lock', 'align-left', 'bring-to-front']
		const editor = await setup({
			actions(_editor, actions) {
				for (const id of replaced) {
					actions[id] = { id, label: actions[id].label, kbd: actions[id].kbd, onSelect() {} }
				}
				return actions
			},
		})
		expect(replaced.map(row)).toEqual([null, null, null])
		act(() => editor.selectAll())
		expect(replaced.map((id) => row(id) !== null)).toEqual([true, true, true])
	})
})

const SUBMENU_ACTIONS = [...EDIT_ACTIONS, ...ARRANGE_ACTIONS, ...REORDER_ACTIONS]

describe('submenu action lists', () => {
	it('only name built-in actions', async () => {
		let actions: TLUiActionsContextType = {}
		await setup({
			actions(_editor, a) {
				actions = a
				return a
			},
		})
		expect(SUBMENU_ACTIONS.filter((id) => !actions[id])).toEqual([])
	})

	it('report nothing enabled when every listed action was deleted', async () => {
		rendered = await renderSvelteDraw(
			{
				components: { QuickActions: null },
				overrides: {
					actions(_editor, actions) {
						for (const id of SUBMENU_ACTIONS) delete actions[id]
						return actions
					},
				},
			},
			{ waitForPatterns: false, child: SomeActionsEnabledProbe }
		)
		const { editor } = rendered
		act(() => {
			editor.createShapes([
				{ id: createShapeId('a'), type: 'geo' },
				{ id: createShapeId('b'), type: 'geo', x: 200 },
				{ id: createShapeId('c'), type: 'geo', x: 400 },
			])
			editor.selectAll()
		})
		expect(screen.getByTestId('probe').textContent).toBe('false false false')
	})
})
