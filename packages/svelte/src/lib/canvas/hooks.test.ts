import { createShapeId, tlmenus } from '@svelte-draw/editor'
import { mount, unmount } from 'svelte'
import { afterEach, describe, expect, it } from 'vitest'
import { defaultEditorComponents } from './componentsContext'
import DefaultCanvas from './DefaultCanvas.svelte'
import DefaultShapeWrapper from './DefaultShapeWrapper.svelte'
import { createUniqueSafeId, getSharedSafeId } from './safeId'
import EditorHarness from './test/EditorHarness.svelte'
import { flush } from './test/helpers'
import HooksProbe from './test/HooksProbe.svelte'

describe('canvas hooks', () => {
	let app: ReturnType<typeof mount> | undefined
	afterEach(() => {
		if (app) unmount(app)
		app = undefined
		document.body.innerHTML = ''
	})

	it('createUniqueSafeId returns unique, selector-safe ids', () => {
		const a = createUniqueSafeId('grid')
		const b = createUniqueSafeId('grid')
		expect(a).not.toBe(b)
		expect(a).not.toContain(':')
		expect(a.endsWith('grid')).toBe(true)
	})

	it('getSharedSafeId throws outside an id scope', () => {
		expect(() => getSharedSafeId('cursor')).toThrow()
	})

	it('exposes the default components of this layer', () => {
		expect(defaultEditorComponents.Canvas).toBe(DefaultCanvas)
		expect(defaultEditorComponents.ShapeWrapper).toBe(DefaultShapeWrapper)
		expect(defaultEditorComponents.InFrontOfTheCanvas).toBeNull()
	})

	it('uses components overrides, falling back to defaults', async () => {
		const Background = (anchor: any) => {
			const div = document.createElement('div')
			div.className = 'custom-background'
			anchor.before(div)
		}
		app = mount(EditorHarness, {
			target: document.body,
			props: { components: { Background: Background as any } },
		})
		await flush()
		expect(document.querySelector('.custom-background')).not.toBeNull()
		// the default Grid/SvgDefs etc. are still in place
		expect(document.querySelector('.tl-svg-context')).not.toBeNull()
	})

	it('reports editing/cropping/peers/menus and positions elements with transform', async () => {
		const id = createShapeId()
		let readers!: any
		const Probe = (anchor: any) =>
			HooksProbe(anchor, {
				shapeId: id,
				report: (r: any) => {
					readers = r
				},
			})
		app = mount(EditorHarness, {
			target: document.body,
			props: {
				components: { OnTheCanvas: Probe as any },
			},
		})
		await flush()

		expect(readers.isEditing()).toBe(false)
		expect(readers.isCropping()).toBe(false)
		expect(readers.peerIds()).toEqual([])

		const transformed = document.querySelector<HTMLElement>('[data-testid="transformed"]')!
		expect(transformed.style.transform).toBe(
			'translate(10px, 20px) scale(2) rotate(0.5rad) translate(1px, 2px)'
		)
		expect(
			document.querySelector<HTMLElement>('[data-testid="not-transformed"]')!.style.transform
		).toBe('')

		expect(readers.menu.isOpen).toBe(false)
		readers.menu.onOpenChange(true)
		await flush()
		expect(readers.menu.isOpen).toBe(true)
		expect(tlmenus.getOpenMenus()).toContain('probe-menu')
		readers.menu.onOpenChange(false)
		await flush()
		expect(readers.menu.isOpen).toBe(false)
	})
})
