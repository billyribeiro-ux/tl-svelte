import { flushSync } from 'svelte'
import { describe, expect, it, vi } from 'vitest'
import {
	createMentionSuggestion,
	filterMentionMembers,
	isMentionPickerOpen,
} from './mention-suggestion.svelte'

const members = [
	{ id: 'u1', name: 'Ada Lovelace' },
	{ id: 'u2', name: 'Alan Turing' },
	{ id: 'u3', name: 'Grace Hopper' },
]
const ids = (q: string) => filterMentionMembers(members, q).map((m) => m.id)

describe('filterMentionMembers', () => {
	it('matches a case-insensitive substring; empty query keeps all', () => {
		expect(ids('')).toEqual(['u1', 'u2', 'u3'])
		expect(ids('grace')).toEqual(['u3'])
		expect(ids('AL')).toEqual(['u2']) // "Alan", case-insensitive; "Ada Lovelace" has no "al"
		expect(ids('zzz')).toEqual([])
	})
})

describe('createMentionSuggestion render', () => {
	const members = [
		{ id: 'u1', name: 'Ada Lovelace' },
		{ id: 'u2', name: 'Alan Turing' },
	]

	function setup() {
		const editorDom = document.createElement('div')
		document.body.appendChild(editorDom)
		const command = vi.fn()
		const renderer = createMentionSuggestion(() => members).render!()
		const props = (items: typeof members) =>
			({ editor: { view: { dom: editorDom } }, items, command }) as any
		return { editorDom, command, renderer, props }
	}

	it('mounts the popup, drives selection by key, and tears down on exit', () => {
		const { editorDom, command, renderer, props } = setup()
		renderer.onStart!(props(members))
		flushSync()
		expect(document.querySelector('.tlui-cmt-mention-popup')).not.toBeNull()
		expect(isMentionPickerOpen()).toBe(true)
		expect(document.querySelectorAll('.tlui-cmt-mention-list__item')).toHaveLength(2)

		const key = (k: string) =>
			renderer.onKeyDown!({ event: new KeyboardEvent('keydown', { key: k }) } as any)
		expect(key('ArrowDown')).toBe(true)
		expect(key('Enter')).toBe(true)
		expect(command).toHaveBeenCalledWith({ id: 'u2', label: 'Alan Turing' })

		renderer.onUpdate!(props([members[0]]))
		flushSync()
		expect(document.querySelectorAll('.tlui-cmt-mention-list__item')).toHaveLength(1)

		renderer.onExit!(props([]))
		expect(document.querySelector('.tlui-cmt-mention-popup')).toBeNull()
		expect(isMentionPickerOpen()).toBe(false)
		editorDom.remove()
	})

	it('hides the roster on Escape and on blur, and swallows Enter on an empty roster', () => {
		const { editorDom, renderer, props } = setup()
		renderer.onStart!(props([]))
		flushSync()
		const stop = vi.fn()
		const enter = { key: 'Enter', stopPropagation: stop } as any
		expect(renderer.onKeyDown!({ event: enter } as any)).toBe(true)
		expect(stop).toHaveBeenCalled()
		expect(isMentionPickerOpen()).toBe(false)

		renderer.onUpdate!(props(members))
		expect(isMentionPickerOpen()).toBe(true)
		editorDom.dispatchEvent(new Event('blur'))
		expect(isMentionPickerOpen()).toBe(false)
		expect(
			(document.querySelector('.tlui-cmt-mention-popup') as HTMLElement).style.display
		).toBe('none')
		renderer.onExit!(props([]))
		editorDom.remove()
	})
})
