import { flushSync, mount, unmount, type Component } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CommentPin from './CommentPin.svelte'
import CountBadge from './CountBadge.svelte'
import EmojiPicker from './EmojiPicker.svelte'
import EmptyState from './EmptyState.svelte'
import Reaction from './Reaction.svelte'
import Reactions from './Reactions.svelte'
import SendButton from './SendButton.svelte'
import ReactionHarness from './test/ReactionHarness.svelte'

let mounted: { component: ReturnType<typeof mount>; target: HTMLElement }[] = []

afterEach(() => {
	for (const { component, target } of mounted) {
		unmount(component)
		target.remove()
	}
	mounted = []
})

function render<P extends Record<string, any>>(component: Component<P>, props: P) {
	const target = document.createElement('div')
	document.body.appendChild(target)
	const instance = mount(component, { target, props })
	mounted.push({ component: instance, target })
	flushSync()
	return target
}

const reactors = [{ name: 'Ada', you: false }]

describe('Reaction', () => {
	it('renders an interactive pill as a pressed-state button', () => {
		const onClick = vi.fn()
		const target = render(Reaction, {
			emoji: '👍',
			count: 2,
			active: true,
			reactors: [],
			onClick,
		})
		const button = target.querySelector('button')!
		expect(button.className).toBe('tlui-cmt-reaction tlui-cmt-reaction--active')
		expect(button.getAttribute('aria-pressed')).toBe('true')
		expect(button.getAttribute('aria-label')).toBe('👍 2')
		expect(button.querySelector('.tlui-cmt-reaction__emoji')!.textContent).toBe('👍')
		expect(button.querySelector('.tlui-cmt-reaction__count')!.textContent).toBe('2')
		button.click()
		expect(onClick).toHaveBeenCalledOnce()
	})

	// An inert pill is plain content, not a control, so it stays valid inside an anchor row.
	it('renders an inert pill (no handler) as an img-role span', () => {
		const target = render(Reaction, {
			emoji: '🎉',
			count: 1,
			active: false,
			reactors,
			enableHoverList: false,
		})
		expect(target.querySelector('button')).toBeNull()
		const pill = target.querySelector('span.tlui-cmt-reaction')!
		expect(pill.getAttribute('role')).toBe('img')
		expect(pill.getAttribute('aria-label')).toBe('🎉 1')
		expect(pill.className).toBe('tlui-cmt-reaction')
	})
})

describe('Reaction hover list', () => {
	// The tooltip trigger props are spread onto the pill, whichever element it renders as.
	it('keeps the pill and its labelling when wrapped in the default tooltip', () => {
		const target = render(ReactionHarness, {
			emoji: '👍',
			count: 1,
			active: false,
			reactors,
			onClick: () => {},
		})
		const button = target.querySelector('button.tlui-cmt-reaction')!
		expect(button.getAttribute('aria-label')).toBe('👍 1')
		expect(button.getAttribute('aria-pressed')).toBe('false')
	})
})

describe('Reactions', () => {
	it('renders nothing when there are no reactions', () => {
		const target = render(Reactions, { reactions: [] })
		expect(target.querySelector('.tlui-cmt-reactions')).toBeNull()
	})

	it('toggles through onToggle only when the viewer can react', () => {
		const onToggle = vi.fn()
		const reactions = [{ emoji: '👍', count: 1, active: false, reactors: [] }]

		const interactive = render(Reactions, { reactions, onToggle })
		interactive.querySelector('button')!.click()
		expect(onToggle).toHaveBeenCalledWith('👍')

		const readOnly = render(Reactions, { reactions, onToggle, canReact: false })
		expect(readOnly.querySelector('button')).toBeNull()
		expect(readOnly.querySelector('.tlui-cmt-reaction')).not.toBeNull()
	})
})

describe('EmojiPicker', () => {
	it('offers the palette, marks selected emoji pressed, and reports picks with the event', () => {
		const onSelect = vi.fn()
		const target = render(EmojiPicker, { emoji: ['👍', '🎉'], selected: ['🎉'], onSelect })
		const items = target.querySelectorAll('button')
		expect(items).toHaveLength(2)
		expect(items[0].getAttribute('aria-pressed')).toBe('false')
		expect(items[1].getAttribute('aria-pressed')).toBe('true')
		expect(items[1].className).toBe(
			'tlui-cmt-emoji-picker__item tlui-cmt-emoji-picker__item--active'
		)
		items[0].click()
		expect(onSelect).toHaveBeenCalledOnce()
		expect(onSelect.mock.calls[0][0]).toBe('👍')
		expect(onSelect.mock.calls[0][1]).toBeInstanceOf(MouseEvent)
	})
})

describe('SendButton', () => {
	it('is labelled, clickable, and honours disabled', () => {
		const onClick = vi.fn()
		const target = render(SendButton, { label: 'Send', onClick })
		const button = target.querySelector('button')!
		expect(button.getAttribute('aria-label')).toBe('Send')
		expect(button.title).toBe('Send')
		button.click()
		expect(onClick).toHaveBeenCalledOnce()

		const disabled = render(SendButton, { label: 'Send', disabled: true, onClick })
		expect(disabled.querySelector('button')!.disabled).toBe(true)
	})
})

describe('markers', () => {
	it('CountBadge shows the count and the open ring', () => {
		const target = render(CountBadge, { count: 3, open: true })
		const badge = target.firstElementChild!
		expect(badge.textContent).toBe('3')
		expect(badge.className).toBe('tlui-cmt-marker tlui-cmt-count-badge tlui-cmt-marker--open')
	})

	it('CommentPin swaps its content for a check when resolved', () => {
		const resolved = render(CommentPin, { resolved: true, open: false })
		expect(resolved.firstElementChild!.className).toBe(
			'tlui-cmt-marker tlui-cmt-pin tlui-cmt-pin--resolved'
		)
		expect(resolved.querySelector('svg')).not.toBeNull()

		const unresolved = render(CommentPin, {})
		expect(unresolved.firstElementChild!.className).toBe('tlui-cmt-marker tlui-cmt-pin')
		expect(unresolved.querySelector('svg')).toBeNull()
	})

	it('EmptyState shows its message', () => {
		const target = render(EmptyState, { message: 'Nothing here' })
		expect(target.querySelector('.tlui-cmt-empty__message')!.textContent).toBe('Nothing here')
	})
})
