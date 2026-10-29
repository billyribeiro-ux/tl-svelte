import { flushSync, mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MentionList from './MentionList.svelte'
import MentionPopup from './MentionPopup.svelte'
import type { MentionMember } from './types'

const members: MentionMember[] = [
	{ id: 'u1', name: 'Ada Lovelace', you: true, secondary: 'ada@example.com' },
	{ id: 'u2', name: 'Alan Turing', image: 'https://example.com/a.png' },
	{ id: 'u3', name: 'Grace Hopper', color: 'red' },
]

describe('mention components', () => {
	let target: HTMLElement
	let component: ReturnType<typeof mount> | undefined

	beforeEach(() => {
		target = document.createElement('div')
		document.body.appendChild(target)
	})
	afterEach(() => {
		if (component) unmount(component)
		component = undefined
		target.remove()
	})

	it('renders rows with avatar, name, you marker and secondary line', () => {
		component = mount(MentionList, { target, props: { members, activeIndex: 1 } })
		flushSync()
		const items = target.querySelectorAll('.tlui-cmt-mention-list__item')
		expect(items).toHaveLength(3)
		expect(items[1].classList.contains('tlui-cmt-mention-list__item--active')).toBe(true)
		expect(items[1].getAttribute('aria-selected')).toBe('true')
		expect(items[0].querySelector('.tlui-cmt-mention-list__you')?.textContent).toBe('(You)')
		expect(items[0].querySelector('.tlui-cmt-mention-list__secondary')?.textContent).toBe(
			'ada@example.com'
		)
		expect(items[0].querySelector('.tlui-cmt-avatar')?.textContent?.trim()).toBe('A')
		expect(items[1].querySelector('img.tlui-cmt-avatar--image')).not.toBeNull()
		expect(target.querySelector('[role="listbox"]')).not.toBeNull()
	})

	it('shows the empty state, honouring a custom label', () => {
		component = mount(MentionList, { target, props: { members: [] } })
		flushSync()
		expect(target.querySelector('.tlui-cmt-mention-list--empty')?.textContent?.trim()).toBe(
			'No matches'
		)
		unmount(component)
		component = mount(MentionList, { target, props: { members: [], emptyLabel: 'Nobody' } })
		flushSync()
		expect(target.querySelector('.tlui-cmt-mention-list--empty')?.textContent?.trim()).toBe(
			'Nobody'
		)
	})

	it('selects on click and keeps focus on mousedown', () => {
		const onSelect = vi.fn()
		component = mount(MentionList, { target, props: { members, onSelect } })
		flushSync()
		const button = target.querySelectorAll<HTMLButtonElement>('button')[2]
		const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true })
		button.dispatchEvent(down)
		expect(down.defaultPrevented).toBe(true)
		button.click()
		expect(onSelect).toHaveBeenCalledWith(members[2])
	})

	it('popup: arrows wrap, Enter and Tab complete, and a new item list resets the highlight', () => {
		const command = vi.fn()
		let items = $state.raw(members)
		component = mount(MentionPopup, {
			target,
			props: {
				get items() {
					return items
				},
				command,
			},
		}) as ReturnType<typeof mount> & { onKeyDown(p: { event: KeyboardEvent }): boolean }
		flushSync()
		const popup = component as unknown as { onKeyDown(p: { event: KeyboardEvent }): boolean }
		const key = (k: string) => popup.onKeyDown({ event: new KeyboardEvent('keydown', { key: k }) })

		expect(key('ArrowUp')).toBe(true) // wraps from 0 to the last row
		flushSync()
		expect(
			target.querySelectorAll('.tlui-cmt-mention-list__item')[2].getAttribute('aria-selected')
		).toBe('true')
		expect(key('Enter')).toBe(true)
		expect(command).toHaveBeenLastCalledWith({ id: 'u3', label: 'Grace Hopper' })

		items = [members[1]]
		flushSync()
		expect(key('Tab')).toBe(true)
		expect(command).toHaveBeenLastCalledWith({ id: 'u2', label: 'Alan Turing' })
		expect(key('a')).toBe(false)

		items = []
		flushSync()
		expect(key('Enter')).toBe(false)
	})
})
