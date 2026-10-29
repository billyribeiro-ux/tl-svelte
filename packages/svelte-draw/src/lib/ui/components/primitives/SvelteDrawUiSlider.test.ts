import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SvelteDrawUiSlider from './SvelteDrawUiSlider.svelte'

let app: ReturnType<typeof mount> | undefined

afterEach(() => {
	if (app) unmount(app)
	app = undefined
	document.body.innerHTML = ''
	vi.clearAllMocks()
})

function renderSlider() {
	const calls: string[] = []
	const onValueChange = vi.fn((value: number) => {
		calls.push(`change:${value}`)
	})
	const onHistoryMark = vi.fn((id: string) => {
		calls.push(`mark:${id}`)
	})
	app = mount(SvelteDrawUiSlider, {
		target: document.body,
		props: {
			'data-testid': 'slider',
			value: 2,
			steps: 4,
			label: 'style-panel.opacity',
			title: 'Opacity',
			onValueChange,
			onHistoryMark,
		},
	})
	flushSync()
	const thumb = document.querySelector<HTMLElement>('[role="slider"]')!
	expect(thumb).not.toBeNull()
	return { thumb, calls, onValueChange, onHistoryMark }
}

function keyDown(target: HTMLElement, key: string, init: KeyboardEventInit = {}) {
	target.dispatchEvent(
		new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
	)
	flushSync()
}

describe('SvelteDrawUiSlider', () => {
	it('marks a history stopping point before a keyboard change', () => {
		const { thumb, calls } = renderSlider()

		keyDown(thumb, 'ArrowLeft')

		expect(calls).toEqual(['mark:keyboard slider', 'change:1'])
	})

	it.each(['ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'])(
		'marks a history stopping point for %s',
		(key) => {
			const { thumb, onHistoryMark, onValueChange } = renderSlider()

			keyDown(thumb, key)

			expect(onHistoryMark).toHaveBeenCalledTimes(1)
			expect(onValueChange).toHaveBeenCalledTimes(1)
		}
	)

	it('marks once for a held key so the repeat run is a single undo step', () => {
		const { thumb, onHistoryMark, onValueChange } = renderSlider()

		keyDown(thumb, 'ArrowLeft')
		keyDown(thumb, 'ArrowLeft', { repeat: true })
		keyDown(thumb, 'ArrowLeft', { repeat: true })

		expect(onHistoryMark).toHaveBeenCalledTimes(1)
		expect(onValueChange).toHaveBeenCalledTimes(3)
	})

	it('marks each separate key press', () => {
		const { thumb, onHistoryMark } = renderSlider()

		keyDown(thumb, 'ArrowLeft')
		keyDown(thumb, 'ArrowLeft')
		keyDown(thumb, 'ArrowLeft')

		expect(onHistoryMark).toHaveBeenCalledTimes(3)
	})

	it('does not mark for keys that do not change the value', () => {
		const { thumb, onHistoryMark, onValueChange } = renderSlider()

		keyDown(thumb, 'Tab')
		keyDown(thumb, 'a')
		keyDown(thumb, 'Enter')

		expect(onHistoryMark).not.toHaveBeenCalled()
		expect(onValueChange).not.toHaveBeenCalled()
	})

	it('still marks a history stopping point on pointer down', () => {
		const { onHistoryMark } = renderSlider()
		const root = document.querySelector<HTMLElement>('[data-testid="slider"]')!

		root.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
		flushSync()

		expect(onHistoryMark).toHaveBeenCalledWith('click slider')
	})
})
