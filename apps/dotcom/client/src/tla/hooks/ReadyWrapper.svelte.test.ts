import { createRawSnippet, flushSync, mount, unmount } from 'svelte'
import { describe, expect, it } from 'vitest'
import ReadyWrapper from './ReadyWrapper.svelte'
import TestReadyChild from './TestReadyChild.svelte'

describe('ReadyWrapper', () => {
	it('shrouds its children until one of them calls setIsReady', () => {
		const target = document.createElement('div')
		document.body.append(target)
		const children = createRawSnippet(() => ({ render: () => '<div id="slot"></div>' }))
		const app = mount(ReadyWrapper, { target, props: { children } })
		flushSync()
		const inner = target.querySelector('#slot')!.parentElement!
		expect(inner.inert).toBe(true)
		unmount(app)
		target.remove()
	})

	it('reports ready from outside any wrapper', () => {
		const target = document.createElement('div')
		document.body.append(target)
		const app = mount(TestReadyChild, { target })
		flushSync()
		expect(target.textContent).toBe('ready: true')
		unmount(app)
		target.remove()
	})
})
