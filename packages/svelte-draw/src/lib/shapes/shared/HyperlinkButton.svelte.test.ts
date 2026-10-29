import { flushSync } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createTestEditor, flush, mountInEditor } from '../../../test/svelte/helpers'
import HyperlinkButton from './HyperlinkButton.svelte'

let test: ReturnType<typeof createTestEditor>
let mounted: ReturnType<typeof mountInEditor> | undefined

beforeEach(() => {
	test = createTestEditor()
	mounted = mountInEditor(test, HyperlinkButton, { url: 'https://example.com/a' })
})

afterEach(() => {
	mounted?.unmount()
	test.dispose()
	vi.restoreAllMocks()
})

describe('HyperlinkButton', () => {
	it('renders a safe external link with the icon mask', () => {
		const a = mounted!.target.querySelector('a')!
		expect(a.className).toBe('tl-hyperlink-button')
		expect(a.getAttribute('href')).toBe('https://example.com/a')
		expect(a.getAttribute('target')).toBe('_blank')
		expect(a.getAttribute('rel')).toBe('noopener noreferrer')
		expect(a.getAttribute('title')).toBe('https://example.com/a')
		expect(a.getAttribute('draggable')).toBe('false')
		const icon = a.querySelector<HTMLElement>('.tl-hyperlink__icon')!
		expect(icon.getAttribute('style')).toContain('mask: url("data:image/svg+xml,')
		expect(icon.getAttribute('style')).toContain('-webkit-mask: url("data:image/svg+xml,')
		expect(icon.getAttribute('style')).toContain('center 100% / 100% no-repeat')
	})

	it('hides the button when zoomed far out', async () => {
		const a = mounted!.target.querySelector('a')!
		expect(a.classList.contains('tl-hyperlink-button__hidden')).toBe(false)
		test.editor.setCamera({ x: 0, y: 0, z: 0.1 })
		await flush()
		expect(a.classList.contains('tl-hyperlink-button__hidden')).toBe(true)
		test.editor.setCamera({ x: 0, y: 0, z: 1 })
		flushSync()
		expect(a.classList.contains('tl-hyperlink-button__hidden')).toBe(false)
	})

	it('marks pointer events as handled unless shift is held, before the container sees them', () => {
		const a = mounted!.target.querySelector('a')!
		const mark = vi.spyOn(test.editor, 'markEventAsHandled')
		const atContainer = vi.fn((e: Event) => expect(mark).toHaveBeenCalledWith(e))
		test.container.addEventListener('pointerdown', atContainer)

		a.dispatchEvent(new Event('pointerdown', { bubbles: true }))
		a.dispatchEvent(new Event('pointerup', { bubbles: true }))
		expect(mark).toHaveBeenCalledTimes(2)
		expect(atContainer).toHaveBeenCalledTimes(1)

		test.container.removeEventListener('pointerdown', atContainer)
		mark.mockClear()
		vi.spyOn(test.editor.inputs, 'getShiftKey').mockReturnValue(true)
		a.dispatchEvent(new Event('pointerdown', { bubbles: true }))
		expect(mark).not.toHaveBeenCalled()
	})
})
