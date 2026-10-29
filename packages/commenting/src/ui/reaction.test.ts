import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it } from 'vitest'
import DefaultReactionTooltipContent from './DefaultReactionTooltipContent.svelte'

let mounted: { component: ReturnType<typeof mount>; target: HTMLElement }[] = []

afterEach(() => {
	for (const { component, target } of mounted) {
		unmount(component)
		target.remove()
	}
	mounted = []
})

function sentence(...names: string[]) {
	const target = document.createElement('div')
	document.body.appendChild(target)
	const component = mount(DefaultReactionTooltipContent, {
		target,
		props: { reactors: names.map((name) => ({ name, you: name === 'You' })) },
	})
	mounted.push({ component, target })
	flushSync()
	return target.textContent
}

describe('DefaultReactionTooltipContent', () => {
	// Rendered outside a translation provider, so this is the shipped English of `comments.reacted`.
	it('picks the phrasing by number of reactors', () => {
		expect(sentence('You')).toBe('You reacted')
		expect(sentence('You', 'Bo')).toBe('You and Bo reacted')
		expect(sentence('Ada', 'Bo', 'Cy')).toBe('Ada, Bo and Cy reacted')
		expect(sentence('Ada', 'Bo', 'Cy', 'Di')).toBe('Ada, Bo, Cy and 1 other reacted')
		expect(sentence('Ada', 'Bo', 'Cy', 'Di', 'Ed', 'Fi')).toBe('Ada, Bo, Cy and 3 others reacted')
	})
})
