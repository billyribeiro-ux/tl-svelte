import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PromptTag from './PromptTag.svelte'

describe('PromptTag', () => {
	let component: ReturnType<typeof mount> | undefined

	afterEach(() => {
		if (component) unmount(component)
		component = undefined
		document.body.innerHTML = ''
	})

	it('renders a plain div when there is no click handler', () => {
		component = mount(PromptTag, {
			target: document.body,
			props: { text: 'Selection', icon: 'cursor' },
		})
		flushSync()
		const tag = document.querySelector('.prompt-tag')
		expect(tag?.tagName).toBe('DIV')
		expect(tag?.textContent).toContain('Selection')
		expect(tag?.querySelector('svg.chat-icon')).not.toBeNull()
	})

	it('renders a button that calls onClick', () => {
		const onClick = vi.fn()
		component = mount(PromptTag, {
			target: document.body,
			props: { text: 'Pick', icon: 'target', onClick },
		})
		flushSync()
		const tag = document.querySelector('.prompt-tag') as HTMLButtonElement
		expect(tag.tagName).toBe('BUTTON')
		expect(tag.type).toBe('button')
		tag.click()
		expect(onClick).toHaveBeenCalledOnce()
	})
})
