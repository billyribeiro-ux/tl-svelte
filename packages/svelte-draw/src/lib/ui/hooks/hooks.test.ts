import { describe, expect, it, vi } from 'vitest'

// These tests cover the pure logic and the DOM wiring. The context barrel, the tools provider and
// the external-content handlers pull in UI that is not needed here, so they are stubbed.
vi.mock('../context', () => ({
	getActions: () => ({}),
	getUiEvents: () => () => {},
	getToasts: () => ({}),
	getTranslation: () => (s: string) => s,
}))
vi.mock('./useTools.svelte', () => ({ getTools: () => ({ current: {} }) }))
vi.mock('./useCommentingEnabled.svelte', () => ({
	createCommentingEnabled: () => ({ current: true }),
}))
vi.mock('../../defaultExternalContentHandlers', () => ({
	defaultHandleExternalTextContent: vi.fn(),
}))

import {
	extractIframeFromHtml,
	isValidHttpURL,
	resolvePasteModifiers,
} from './useClipboardEvents.svelte'
import {
	areShortcutsDisabled,
	attachKeyboardShortcuts,
	getHotkeysStringFromKbd,
	parseKbd,
	SKIP_KBDS,
} from './useKeyboardShortcuts.svelte'

describe('parseKbd / getHotkeysStringFromKbd', () => {
	it('parses a single key', () => {
		expect(parseKbd('v')).toEqual([
			{ key: 'v', shift: false, alt: false, ctrl: false, meta: false },
		])
	})

	it('parses modifiers and comma-separated alternatives', () => {
		const parsed = parseKbd('cmd+u,ctrl+u')
		expect(parsed).toHaveLength(2)
		expect(parsed[0]).toMatchObject({ key: 'u', meta: true, ctrl: false })
		expect(parsed[1]).toMatchObject({ key: 'u', meta: false, ctrl: true })
	})

	it('translates the legacy $ ! ? markers', () => {
		expect(getHotkeysStringFromKbd('$z')).toBe('cmd+z,ctrl+z')
		expect(getHotkeysStringFromKbd('$!z')).toBe('cmd+shift+z,ctrl+shift+z')
		expect(getHotkeysStringFromKbd('?a')).toBe('alt+a')
		expect(getHotkeysStringFromKbd('v')).toBe('v')
	})

	it('leaves a dangling modifier unregistered', () => {
		expect(parseKbd('alt+shift+')).toEqual([])
	})
})

describe('clipboard helpers', () => {
	it('resolvePasteModifiers: alt inverts the paste-at-cursor preference', () => {
		expect(resolvePasteModifiers(false, false, true)).toEqual({
			isPlainText: false,
			pasteAtCursor: true,
		})
		expect(resolvePasteModifiers(true, true, true)).toEqual({
			isPlainText: true,
			pasteAtCursor: false,
		})
	})

	it('isValidHttpURL accepts only http(s)', () => {
		expect(isValidHttpURL('https://example.com/a')).toBe(true)
		expect(isValidHttpURL('javascript:alert(1)')).toBe(false)
		expect(isValidHttpURL('not a url')).toBe(false)
	})

	it('extractIframeFromHtml reads size attributes, then style, then defaults', () => {
		expect(
			extractIframeFromHtml('<iframe src="https://e.com/x" width="100" height="50"></iframe>')
		).toEqual({ src: 'https://e.com/x', width: 100, height: 50 })
		expect(
			extractIframeFromHtml(
				'<iframe src="https://e.com/x" style="width: 300px; height: 200px"></iframe>'
			)
		).toEqual({ src: 'https://e.com/x', width: 300, height: 200 })
		expect(extractIframeFromHtml('<iframe src="https://e.com/x"></iframe>')).toEqual({
			src: 'https://e.com/x',
			width: 425,
			height: 350,
		})
		expect(extractIframeFromHtml('<iframe src="javascript:1"></iframe>')).toBeNull()
		expect(extractIframeFromHtml('<p>no frame</p>')).toBeNull()
	})
})

function makeEditor(overrides: Record<string, unknown> = {}) {
	const body = document.createElement('div')
	const editor: any = {
		menus: { hasAnyOpenMenus: () => false },
		getEditingShapeId: () => null,
		getCrashingError: () => null,
		user: { getAreKeyboardShortcutsEnabled: () => true },
		getIsReadonly: () => false,
		getContainerDocument: () => ({ body }),
		inputs: { keys: new Set<string>() },
		...overrides,
	}
	return { editor, body }
}

describe('attachKeyboardShortcuts', () => {
	it('selects the action for its shortcut and prevents the default', () => {
		const { editor, body } = makeEditor()
		const onSelect = vi.fn()
		const detach = attachKeyboardShortcuts({
			editor,
			actions: { undo: { id: 'undo', kbd: '$z', onSelect } } as any,
			tools: {},
			isReadonlyMode: false,
			commentingEnabled: true,
		})
		const down = new KeyboardEvent('keydown', { key: 'z', metaKey: true, cancelable: true })
		body.dispatchEvent(down)
		expect(onSelect).toHaveBeenCalledWith('kbd')
		expect(down.defaultPrevented).toBe(true)

		detach()
		body.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', metaKey: true }))
		expect(onSelect).toHaveBeenCalledTimes(1)
	})

	it('skips actions in SKIP_KBDS, readonly-blocked actions and the gated comment tool', () => {
		const { editor, body } = makeEditor({ getIsReadonly: () => true })
		const copy = vi.fn()
		const edit = vi.fn()
		const comment = vi.fn()
		expect(SKIP_KBDS).toContain('copy')
		attachKeyboardShortcuts({
			editor,
			actions: {
				copy: { id: 'copy', kbd: '$c', onSelect: copy },
				edit: { id: 'edit', kbd: 'q', onSelect: edit },
			} as any,
			tools: { comment: { id: 'comment', kbd: 'c', readonlyOk: true, onSelect: comment } } as any,
			isReadonlyMode: true,
			commentingEnabled: false,
		})
		body.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', metaKey: true }))
		body.dispatchEvent(new KeyboardEvent('keydown', { key: 'q' }))
		body.dispatchEvent(new KeyboardEvent('keydown', { key: 'c' }))
		expect(copy).not.toHaveBeenCalled()
		expect(edit).not.toHaveBeenCalled()
		expect(comment).not.toHaveBeenCalled()
	})

	it('does not run tool shortcuts while shortcuts are disabled', () => {
		const { editor, body } = makeEditor({ getEditingShapeId: () => 'shape:1' })
		expect(areShortcutsDisabled(editor)).toBe(true)
		const onSelect = vi.fn()
		attachKeyboardShortcuts({
			editor,
			actions: {},
			tools: { hand: { id: 'hand', kbd: 'h', onSelect } } as any,
			isReadonlyMode: false,
			commentingEnabled: true,
		})
		body.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
		expect(onSelect).not.toHaveBeenCalled()
	})
})
