import { atom, createShapeId } from '@svelte-draw/editor'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TLUiActionItem } from '../../lib/ui/context/actions.svelte'
import type { TLUiOverrides } from '../../lib/ui/overrides.svelte'
import ActionItem from '../svelte/fixtures/ActionItem.svelte'
import ActionItemPair from '../svelte/fixtures/ActionItemPair.svelte'
import ActionItemWithSome from '../svelte/fixtures/ActionItemWithSome.svelte'
import CheckboxMainMenu from '../svelte/fixtures/CheckboxMainMenu.svelte'
import GroupOrUngroupHost from '../svelte/fixtures/GroupOrUngroupHost.svelte'
import MenuHost from '../svelte/fixtures/MenuHost.svelte'
import SomeEnabled from '../svelte/fixtures/SomeEnabled.svelte'
import {
	act,
	fireEvent,
	renderSvelteDraw,
	screen,
	type RenderedSvelteDraw,
} from '../svelte/renderSvelteDraw'

const $enabled = atom('test enabled', false)
const $available = atom('test available', false)

const overrides: TLUiOverrides = {
	actions(_editor, actions) {
		actions['gated'] = {
			id: 'gated',
			label: 'action.group',
			icon: 'group',
			isEnabled: () => $enabled.get(),
			onSelect() {},
		}
		actions['ungated'] = { id: 'ungated', label: 'action.group', icon: 'group', onSelect() {} }
		actions['unavailable'] = {
			id: 'unavailable',
			label: 'action.group',
			icon: 'group',
			isAvailable: () => $available.get(),
			onSelect() {},
		}
		actions['group-spread'] = { ...actions['group'], id: 'group-spread', onSelect() {} }
		actions['group-replaced'] = {
			id: 'group-replaced',
			label: 'action.group',
			icon: 'group',
			onSelect() {},
		}
		return actions
	},
}

let rendered: RenderedSvelteDraw | undefined
afterEach(() => {
	rendered?.unmount()
	rendered = undefined
})

/** Renders `content` in an icons menu inside a toolbar, as the actions menu does. */
async function setup(content: unknown, contentProps: Record<string, unknown> = {}) {
	act(() => {
		$enabled.set(false)
		$available.set(false)
	})
	rendered = await renderSvelteDraw(
		{ overrides, components: { QuickActions: null } },
		{
			waitForPatterns: false,
			child: MenuHost,
			childProps: { type: 'icons', sourceId: 'actions-menu', content, contentProps },
		}
	)
	return { editor: rendered.editor }
}

const button = (id: string) =>
	screen.queryByTestId(`actions-menu.${id}`) as HTMLButtonElement | null

describe('SvelteDrawUiMenuActionItem', () => {
	it('disables by default and follows isEnabled reactively', async () => {
		await setup(ActionItem, { actionId: 'gated' })
		expect(button('gated')!.disabled).toBe(true)
		act(() => $enabled.set(true))
		expect(button('gated')!.disabled).toBe(false)
	})

	it('hides when disabled with whenDisabled="hide"', async () => {
		await setup(ActionItem, { actionId: 'gated', whenDisabled: 'hide' })
		expect(button('gated')).toBeNull()
		act(() => $enabled.set(true))
		expect(button('gated')).not.toBeNull()
	})

	it('hides on an explicit disabled prop with whenDisabled="hide"', async () => {
		await setup(ActionItem, { actionId: 'ungated', disabled: true, whenDisabled: 'hide' })
		expect(button('ungated')).toBeNull()
	})

	it('keeps actions without isEnabled enabled', async () => {
		await setup(ActionItem, { actionId: 'ungated', whenDisabled: 'hide' })
		expect(button('ungated')!.disabled).toBe(false)
	})

	it('ORs an explicit disabled prop with isEnabled', async () => {
		await setup(ActionItem, { actionId: 'gated', disabled: true })
		act(() => $enabled.set(true))
		expect(button('gated')!.disabled).toBe(true)
	})

	it('stays disabled when isEnabled is false even with disabled={false}', async () => {
		await setup(ActionItem, { actionId: 'gated', disabled: false })
		expect(button('gated')!.disabled).toBe(true)
	})

	it('keeps the gate on a spread override and drops it on a wholesale replacement', async () => {
		const { editor } = await setup(ActionItemPair)
		expect(button('group-spread')!.disabled).toBe(true)
		expect(button('group-replaced')!.disabled).toBe(false)
		act(() => {
			editor.createShapes([
				{ id: createShapeId('a'), type: 'geo' },
				{ id: createShapeId('b'), type: 'geo', x: 200 },
			])
			editor.selectAll()
		})
		expect(button('group-spread')!.disabled).toBe(false)
	})
})

describe('isAvailable', () => {
	it('hides the menu item whatever whenDisabled says', async () => {
		await setup(ActionItem, { actionId: 'unavailable', whenDisabled: 'disable' })
		expect(button('unavailable')).toBeNull()
		act(() => $available.set(true))
		expect(button('unavailable')!.disabled).toBe(false)
	})

	it('counts as not enabled for useSomeActionsEnabled', async () => {
		await setup(SomeEnabled, { ids: ['unavailable'] })
		expect(screen.getByTestId('some').textContent).toBe('false')
		act(() => $available.set(true))
		expect(screen.getByTestId('some').textContent).toBe('true')
	})
})

describe('useSomeActionsEnabled', () => {
	it('is true when any listed action is enabled and ignores unknown ids', async () => {
		await setup(SomeEnabled, { ids: ['gated', 'missing'] })
		expect(screen.getByTestId('some').textContent).toBe('false')
		act(() => $enabled.set(true))
		expect(screen.getByTestId('some').textContent).toBe('true')
	})

	it('treats non-readonlyOk actions as unavailable in readonly', async () => {
		const { editor } = await setup(SomeEnabled, { ids: ['ungated'] })
		expect(screen.getByTestId('some').textContent).toBe('true')
		act(() => editor.updateInstanceState({ isReadonly: true }))
		expect(screen.getByTestId('some').textContent).toBe('false')
	})
})

describe('GroupOrUngroupMenuItem', () => {
	it('shows ungroup when the group action was deleted', async () => {
		rendered = await renderSvelteDraw(
			{
				components: { QuickActions: null },
				overrides: {
					actions(_e, actions) {
						delete actions['group']
						return actions
					},
				},
			},
			{
				waitForPatterns: false,
				child: MenuHost,
				childProps: { type: 'icons', sourceId: 'actions-menu', content: GroupOrUngroupHost },
			}
		)
		const { editor } = rendered
		const group = createShapeId('group')
		act(() => {
			editor.createShapes([
				{ id: createShapeId('a'), type: 'geo' },
				{ id: createShapeId('b'), type: 'geo', x: 200 },
			])
			editor.groupShapes([createShapeId('a'), createShapeId('b')], { groupId: group })
			editor.select(group)
		})
		expect(button('ungroup')).not.toBeNull()
	})
})

describe('helper buttons', () => {
	it('do not run a disabled action', async () => {
		const onSelect = vi.fn()
		rendered = await renderSvelteDraw(
			{
				components: { QuickActions: null },
				overrides: {
					actions(_editor, actions) {
						actions['blocked'] = {
							id: 'blocked',
							label: 'action.group',
							icon: 'group',
							isEnabled: () => false,
							onSelect,
						}
						return actions
					},
				},
			},
			{
				waitForPatterns: false,
				child: MenuHost,
				childProps: {
					type: 'helper-buttons',
					sourceId: 'helper-buttons',
					toolbar: false,
					content: ActionItem,
					contentProps: { actionId: 'blocked' },
				},
			}
		)
		const el = screen.getByTestId('helper-buttons.blocked') as HTMLButtonElement
		expect(el.disabled).toBe(true)
		fireEvent.click(el)
		expect(onSelect).not.toHaveBeenCalled()
	})
})

describe('keyboard shortcuts dialog', () => {
	async function renderKbdItem(
		action: Partial<TLUiActionItem> & { id: string },
		itemProps: Record<string, unknown>
	) {
		rendered = await renderSvelteDraw(
			{
				components: { QuickActions: null },
				overrides: {
					actions(_editor, actions) {
						actions[action.id] = { label: 'action.group', onSelect() {}, ...action }
						return actions
					},
				},
			},
			{
				waitForPatterns: false,
				child: MenuHost,
				childProps: {
					type: 'keyboard-shortcuts',
					sourceId: 'kbd',
					toolbar: false,
					content: ActionItem,
					contentProps: { actionId: action.id, ...itemProps },
				},
			}
		)
	}

	async function renderDialogItem(props: { whenDisabled?: 'hide' | 'disable' }) {
		await renderKbdItem({ id: 'unavailable-kbd', kbd: 'shift+9', isAvailable: () => false }, props)
		return screen.queryByTestId('kbd.unavailable-kbd')
	}

	it('lists an unavailable action', async () => {
		expect(await renderDialogItem({})).not.toBeNull()
	})

	it("hides an available action that can't run when the item would hide", async () => {
		await renderKbdItem(
			{ id: 'disabled-kbd', kbd: 'shift+8', isEnabled: () => false },
			{ whenDisabled: 'hide' }
		)
		expect(screen.queryByTestId('kbd.disabled-kbd')).toBeNull()
	})

	it('lists an unavailable action even when the item would hide', async () => {
		expect(await renderDialogItem({ whenDisabled: 'hide' })).not.toBeNull()
	})
})

describe('SvelteDrawUiMenuActionCheckboxItem', () => {
	it('reads checked from isChecked unless checked is passed, and follows isEnabled', async () => {
		const $checked = atom('test checked', false)
		rendered = await renderSvelteDraw(
			{
				overrides: {
					actions(_editor, actions) {
						actions['test-toggle'] = {
							id: 'test-toggle',
							label: 'action.toggle-grid',
							checkbox: true,
							isChecked: () => $checked.get(),
							isEnabled: () => $enabled.get(),
							onSelect() {},
						}
						return actions
					},
				},
				components: { MainMenu: CheckboxMainMenu as any },
			},
			{ waitForPatterns: false }
		)
		const { editor } = rendered
		act(() => $enabled.set(false))
		act(() => editor.menus.addOpenMenu('main menu'))
		const toggle = await screen.findByRole('menuitemcheckbox', { name: /grid/i })
		const forced = screen.getByRole('menuitemcheckbox', { name: /snap/i })
		expect([toggle.getAttribute('aria-checked'), toggle.hasAttribute('data-disabled')]).toEqual([
			'false',
			true,
		])
		expect(forced.getAttribute('aria-checked')).toBe('true')
		expect(screen.queryByRole('menuitemcheckbox', { name: /wrap/i })).toBeNull()
		act(() => {
			$checked.set(true)
			$enabled.set(true)
		})
		expect([toggle.getAttribute('aria-checked'), toggle.hasAttribute('data-disabled')]).toEqual([
			'true',
			false,
		])
	})
})

describe('a predicate that throws', () => {
	it('keeps an unavailable action hidden when another of its predicates throws', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {})
		rendered = await renderSvelteDraw(
			{
				components: { QuickActions: null },
				overrides: {
					actions(_editor, actions) {
						actions['throws-checked'] = {
							id: 'throws-checked',
							label: 'action.group',
							icon: 'group',
							isAvailable: () => false,
							isChecked: () => {
								throw new Error('boom')
							},
							onSelect() {},
						}
						return actions
					},
				},
			},
			{
				waitForPatterns: false,
				child: MenuHost,
				childProps: {
					type: 'icons',
					sourceId: 'actions-menu',
					content: ActionItem,
					contentProps: { actionId: 'throws-checked' },
				},
			}
		)
		expect(button('throws-checked')).toBeNull()
		error.mockRestore()
	})

	it('disables the item, reports once, and keeps the editor running', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {})
		rendered = await renderSvelteDraw(
			{
				components: { QuickActions: null },
				overrides: {
					actions(_editor, actions) {
						actions['throws'] = {
							id: 'throws',
							label: 'action.group',
							icon: 'group',
							isEnabled: (editor) => {
								editor.getSelectedShapeIds()
								throw new Error('boom')
							},
							onSelect() {},
						}
						return actions
					},
				},
			},
			{
				waitForPatterns: false,
				child: MenuHost,
				childProps: {
					type: 'icons',
					sourceId: 'actions-menu',
					content: ActionItem,
					contentProps: { actionId: 'throws' },
				},
			}
		)
		const { editor } = rendered
		act(() => {
			editor.createShapes([{ id: createShapeId('a'), type: 'geo' }])
			editor.selectAll()
		})
		expect(button('throws')!.disabled).toBe(true)
		expect(screen.queryAllByTestId('canvas').length).toBeGreaterThan(0)
		expect(error.mock.calls.filter(([msg]) => String(msg).includes('"throws"'))).toHaveLength(1)
		error.mockRestore()
	})

	async function renderThrowing(action: Partial<TLUiActionItem>, id = 'throwing') {
		rendered = await renderSvelteDraw(
			{
				components: { QuickActions: null },
				overrides: {
					actions(_editor, actions) {
						actions[id] = {
							id,
							label: 'action.group',
							icon: 'group',
							onSelect() {},
							...action,
						}
						return actions
					},
				},
			},
			{
				waitForPatterns: false,
				child: MenuHost,
				childProps: {
					type: 'icons',
					sourceId: 'actions-menu',
					content: ActionItemWithSome,
					contentProps: { id },
				},
			}
		)
		return {
			disabled: button(id)?.disabled,
			someEnabled: screen.getByTestId('some').textContent,
		}
	}

	it('disables an item whose isChecked throws', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {})
		const thrower = () => {
			throw new Error('boom')
		}
		expect(await renderThrowing({ checkbox: true, isChecked: thrower })).toEqual({
			disabled: true,
			someEnabled: 'false',
		})
		error.mockRestore()
	})

	it('disables an item whose isAvailable throws', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {})
		const thrower = () => {
			throw new Error('boom')
		}
		expect(await renderThrowing({ isAvailable: thrower })).toEqual({
			disabled: true,
			someEnabled: 'false',
		})
		error.mockRestore()
	})

	it('reports each throwing predicate once, by name', async () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {})
		const thrower = () => {
			throw new Error('boom')
		}
		await renderThrowing({ isEnabled: thrower, isChecked: thrower }, 'throws-twice')
		const reports = error.mock.calls
			.map(([msg]) => String(msg))
			.filter((m) => m.includes('throws-twice'))
		expect(reports.map((m) => m.match(/\b(isAvailable|isEnabled|isChecked)\b/)?.[0])).toEqual([
			'isEnabled',
			'isChecked',
		])
		error.mockRestore()
	})
})

it('does not run an action that became disabled after render', async () => {
	let enabled = true
	const onSelect = vi.fn()
	rendered = await renderSvelteDraw(
		{
			components: { QuickActions: null },
			overrides: {
				actions(_editor, actions) {
					actions['stale'] = {
						id: 'stale',
						label: 'action.group',
						icon: 'group',
						isEnabled: () => enabled,
						onSelect,
					}
					return actions
				},
			},
		},
		{
			waitForPatterns: false,
			child: MenuHost,
			childProps: {
				type: 'icons',
				sourceId: 'actions-menu',
				content: ActionItem,
				contentProps: { actionId: 'stale' },
			},
		}
	)
	enabled = false
	fireEvent.click(
		rendered.target.querySelector('[data-testid="actions-menu.stale"]') as HTMLElement
	)
	expect(onSelect).not.toHaveBeenCalled()
})
