import { flushSync, mount, unmount } from 'svelte'
import { toRichText } from 'svelte-draw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { CommentComposerProps } from './comment-composer'
import CommentComposer from './CommentComposer.svelte'

let mounted: { component: ReturnType<typeof mount>; target: HTMLElement }[] = []

afterEach(() => {
	for (const { component, target } of mounted) {
		unmount(component)
		target.remove()
	}
	mounted = []
})

function render(props: Partial<CommentComposerProps> = {}) {
	const target = document.createElement('div')
	document.body.appendChild(target)
	const component = mount(CommentComposer, {
		target,
		props: { author: { name: 'Ada' }, placeholder: 'Add a comment…', ...props },
	})
	mounted.push({ component, target })
	flushSync()
	return target
}

describe('CommentComposer', () => {
	it('mounts a labelled textbox with the placeholder shown while empty', () => {
		const target = render({ onSubmit: () => {} })
		const input = target.querySelector('.tlui-cmt-input[role="textbox"]')!
		expect(input.getAttribute('aria-label')).toBe('Add a comment…')
		expect(input.getAttribute('aria-multiline')).toBe('true')
		expect(input.getAttribute('contenteditable')).toBe('true')
		expect(target.querySelector('.tlui-cmt-input__placeholder')!.textContent).toBe('Add a comment…')
	})

	it('is display-only without onChange / onSubmit: not editable and no send button', () => {
		const target = render()
		expect(
			target.querySelector('.tlui-cmt-input[role="textbox"]')!.getAttribute('contenteditable')
		).toBe('false')
		expect(target.querySelector('.tlui-cmt-send')).toBeNull()
	})

	it('renders a pre-filled value without the placeholder', () => {
		const target = render({ value: toRichText('Hello'), onChange: () => {} })
		expect(target.querySelector('.tlui-cmt-input[role="textbox"]')!.textContent).toBe('Hello')
		expect(target.querySelector('.tlui-cmt-input__placeholder')).toBeNull()
	})

	it("leads with the author's avatar by default", () => {
		const target = render({ onSubmit: () => {} })
		expect(target.querySelector('.tlui-cmt-avatar')!.textContent!.trim()).toBe('A')
	})

	it('wires the send button to onSubmit and honours disabled', () => {
		const onSubmit = vi.fn()
		const target = render({ onSubmit, sendLabel: 'Post' })
		const send = target.querySelector<HTMLButtonElement>('.tlui-cmt-send')!
		expect(send.getAttribute('aria-label')).toBe('Post')
		send.click()
		expect(onSubmit).toHaveBeenCalledOnce()

		const disabled = render({ onSubmit, disabled: true })
		expect(disabled.querySelector<HTMLButtonElement>('.tlui-cmt-send')!.disabled).toBe(true)
	})

	it('submits on Enter, and not while disabled', () => {
		const onSubmit = vi.fn()
		const target = render({ onSubmit })
		const input = target.querySelector('.tlui-cmt-input[role="textbox"]')!
		input.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
		)
		expect(onSubmit).toHaveBeenCalledOnce()

		const blocked = vi.fn()
		const disabledTarget = render({ onSubmit: blocked, disabled: true })
		disabledTarget
			.querySelector('.tlui-cmt-input[role="textbox"]')!
			.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
			)
		expect(blocked).not.toHaveBeenCalled()
	})

	// Up in an empty composer hands off to the host (chat-style "edit my last message").
	it('hands ArrowUp in an empty field to onArrowUpWhenEmpty', () => {
		const onArrowUpWhenEmpty = vi.fn()
		const target = render({ onSubmit: () => {}, onArrowUpWhenEmpty })
		target
			.querySelector('.tlui-cmt-input[role="textbox"]')!
			.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
			)
		expect(onArrowUpWhenEmpty).toHaveBeenCalledOnce()
	})
})
