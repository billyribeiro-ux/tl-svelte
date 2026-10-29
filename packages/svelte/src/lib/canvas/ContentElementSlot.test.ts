import {
	BaseBoxShapeUtil,
	createShapeId,
	T,
	type Editor,
	type RecordProps,
	type TLShape,
} from '@svelte-draw/editor'
import { mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import EditorHarness from './test/EditorHarness.svelte'
import { flush } from './test/helpers'

const PERSISTENT_SHAPE_TYPE = 'test-persistent'

declare module '@svelte-draw/tlschema' {
	export interface TLGlobalShapePropsMap {
		[PERSISTENT_SHAPE_TYPE]: { w: number; h: number }
	}
}

type IPersistentShape = TLShape<typeof PERSISTENT_SHAPE_TYPE>

// App-owned element registry and parking lot, the way an app using
// getContentElement would keep elements alive across editor sessions.
const elements = new Map<string, HTMLElement>()
let parkingLot: HTMLDivElement
const releaseCalls: Array<{ shapeId: string; element: HTMLElement; slotWasConnected: boolean }> = []

class PersistentShapeUtil extends BaseBoxShapeUtil<IPersistentShape> {
	static override type = PERSISTENT_SHAPE_TYPE
	static override props: RecordProps<IPersistentShape> = {
		w: T.number,
		h: T.number,
	}
	getDefaultProps(): IPersistentShape['props'] {
		return { w: 100, h: 100 }
	}
	getIndicatorPath() {
		return undefined
	}
	component() {
		return null
	}
	override getAppOwnedElement(shape: IPersistentShape) {
		let element = elements.get(shape.id)
		if (!element) {
			element = document.createElement('div')
			element.dataset.testElementFor = shape.id
			elements.set(shape.id, element)
		}
		return element
	}
	override onReleaseAppOwnedElement(shape: IPersistentShape, element: HTMLElement) {
		releaseCalls.push({
			shapeId: shape.id,
			element,
			slotWasConnected: element.parentElement?.isConnected ?? false,
		})
		parkingLot.appendChild(element)
	}
}

function getSlotFor(shapeId: string) {
	return document.querySelector(`[data-shape-id="${shapeId}"] .tl-content-slot`)
}

describe('content element slot', () => {
	const mounted: Array<ReturnType<typeof mount>> = []

	beforeEach(() => {
		elements.clear()
		releaseCalls.length = 0
		parkingLot = document.createElement('div')
		document.body.appendChild(parkingLot)
	})

	afterEach(() => {
		for (const app of mounted.splice(0)) unmount(app)
		parkingLot.remove()
		document.body.innerHTML = ''
	})

	async function renderEditor() {
		let editor!: Editor
		const target = document.createElement('div')
		document.body.appendChild(target)
		const app = mount(EditorHarness, {
			target,
			props: {
				shapeUtils: [PersistentShapeUtil],
				onMount: (e: Editor) => {
					editor = e
				},
			},
		})
		mounted.push(app)
		await flush()
		return {
			editor,
			// The root unmounts with an outro so slots are released while still connected; see
			// ContentElementSlot.svelte.
			unmount: async () => {
				mounted.splice(mounted.indexOf(app), 1)
				await unmount(app, { outro: true })
				await flush()
			},
		}
	}

	it('adopts the app-owned element into the shape and releases it before editor unmount', async () => {
		const { editor, unmount } = await renderEditor()
		const id = createShapeId()

		editor.createShape<IPersistentShape>({ id, type: PERSISTENT_SHAPE_TYPE, x: 0, y: 0 })
		await flush()

		const element = elements.get(id)!
		expect(element).toBeDefined()
		expect(element.parentElement).toBe(getSlotFor(id))
		expect(element.isConnected).toBe(true)

		await unmount()

		// The release callback fired exactly once, while the slot was still
		// connected to the document, so a state-preserving move was possible.
		expect(releaseCalls).toHaveLength(1)
		expect(releaseCalls[0]).toMatchObject({ shapeId: id, element, slotWasConnected: true })
		// The app reclaimed the element into its parking lot and it survived teardown.
		expect(element.parentElement).toBe(parkingLot)
		expect(element.isConnected).toBe(true)
	})

	it('still releases exactly once on a plain unmount (without an outro), but after the slot detached', async () => {
		const { editor } = await renderEditor()
		const id = createShapeId()

		editor.createShape<IPersistentShape>({ id, type: PERSISTENT_SHAPE_TYPE, x: 0, y: 0 })
		await flush()
		const element = elements.get(id)!

		unmount(mounted.pop()!)
		await flush()

		// Svelte removes a destroyed block's DOM before running teardowns, so the best a plain
		// unmount can do is the fallback release from the attachment teardown.
		expect(releaseCalls).toHaveLength(1)
		expect(releaseCalls[0]).toMatchObject({ shapeId: id, element, slotWasConnected: false })
		expect(element.parentElement).toBe(parkingLot)
	})

	it('releases the element when the shape is deleted', async () => {
		const { editor, unmount } = await renderEditor()
		const id = createShapeId()

		editor.createShape<IPersistentShape>({ id, type: PERSISTENT_SHAPE_TYPE, x: 0, y: 0 })
		await flush()

		const element = elements.get(id)!
		expect(element.parentElement).toBe(getSlotFor(id))

		editor.deleteShape(id)
		await flush()

		expect(releaseCalls).toHaveLength(1)
		expect(releaseCalls[0]).toMatchObject({ shapeId: id, element, slotWasConnected: true })
		expect(element.parentElement).toBe(parkingLot)

		await unmount()

		// The slot is gone; no second release for the deleted shape.
		expect(releaseCalls).toHaveLength(1)
	})

	it('re-adopts a parked element when the editor remounts, without recreating it', async () => {
		const first = await renderEditor()
		const id = createShapeId()

		first.editor.createShape<IPersistentShape>({ id, type: PERSISTENT_SHAPE_TYPE, x: 0, y: 0 })
		await flush()

		const element = elements.get(id)!

		await first.unmount()
		expect(element.parentElement).toBe(parkingLot)

		const second = await renderEditor()
		second.editor.createShape<IPersistentShape>({ id, type: PERSISTENT_SHAPE_TYPE, x: 0, y: 0 })
		await flush()

		// The same element instance was adopted into the new editor's slot.
		expect(elements.get(id)).toBe(element)
		expect(element.parentElement).toBe(getSlotFor(id))

		await second.unmount()
		expect(element.parentElement).toBe(parkingLot)
	})

	it('keeps the element in the same DOM position when z-order changes', async () => {
		const { editor, unmount } = await renderEditor()
		const id = createShapeId()
		const otherId = createShapeId()

		editor.createShape<IPersistentShape>({ id, type: PERSISTENT_SHAPE_TYPE, x: 0, y: 0 })
		editor.createShape<IPersistentShape>({
			id: otherId,
			type: PERSISTENT_SHAPE_TYPE,
			x: 50,
			y: 50,
		})
		await flush()

		const element = elements.get(id)!
		const slot = getSlotFor(id)
		expect(element.parentElement).toBe(slot)

		editor.sendToBack([id])
		editor.bringToFront([id])
		await flush()

		// No release fired and the element is still in the same slot node.
		expect(releaseCalls).toHaveLength(0)
		expect(element.parentElement).toBe(slot)
		expect(getSlotFor(id)).toBe(slot)

		await unmount()
	})
})
