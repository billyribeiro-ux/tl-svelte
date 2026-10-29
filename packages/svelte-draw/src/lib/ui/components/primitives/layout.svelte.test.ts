import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it } from 'vitest'
import OrientationHarness from './test/OrientationHarness.svelte'

let app: ReturnType<typeof mount> | undefined
afterEach(() => {
	if (app) unmount(app)
	app = undefined
	document.body.innerHTML = ''
})

function probe(name: string) {
	const el = document.querySelector<HTMLElement>(`[data-testid="${name}"]`)
	expect(el, name).not.toBeNull()
	return { orientation: el!.dataset.orientation, tooltipSide: el!.dataset.tooltipSide }
}

describe('layout orientation context', () => {
	it('defaults to horizontal / bottom outside of a layout', () => {
		app = mount(OrientationHarness, { target: document.body })
		flushSync()
		expect(probe('root')).toEqual({ orientation: 'horizontal', tooltipSide: 'bottom' })
	})

	it('uses the explicit tooltip side and keeps cascading it while the orientation is unchanged', () => {
		app = mount(OrientationHarness, { target: document.body })
		flushSync()
		expect(probe('in-row')).toEqual({ orientation: 'horizontal', tooltipSide: 'top' })
		expect(probe('row-in-row')).toEqual({ orientation: 'horizontal', tooltipSide: 'top' })
	})

	it('picks a side from the new orientation when the orientation changes', () => {
		app = mount(OrientationHarness, { target: document.body })
		flushSync()
		expect(probe('column-in-row')).toEqual({ orientation: 'vertical', tooltipSide: 'right' })
	})

	it('renders the layout class names', () => {
		app = mount(OrientationHarness, { target: document.body })
		flushSync()
		expect(document.querySelector('[data-testid="row"]')!.className).toBe('tlui-row')
		expect(document.querySelector('[data-testid="column"]')!.className).toBe('tlui-column')
	})
})
