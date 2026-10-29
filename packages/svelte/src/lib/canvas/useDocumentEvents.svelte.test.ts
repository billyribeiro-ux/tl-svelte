import { Editor, type TLKeyboardEventInfo } from '@svelte-draw/editor'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { dropHandlers } from './test/dropHandlers'
import DropTarget from './test/DropTarget.svelte'
import EditorHarness from './test/EditorHarness.svelte'
import { flush } from './test/helpers'

const mounted: Array<ReturnType<typeof mount>> = []

function cleanupMounted() {
	for (const app of mounted.splice(0)) unmount(app)
	document.body.innerHTML = ''
}

async function renderEditor() {
	let editor!: Editor
	const app = mount(EditorHarness, {
		target: document.body,
		props: {
			autoFocus: true,
			onMount: (e: Editor) => {
				editor = e
			},
		},
	})
	mounted.push(app)
	await flush()
	const container = document.querySelector<HTMLElement>('.tl-container')!
	return { editor, container }
}

function keyDown(container: HTMLElement, init: KeyboardEventInit) {
	container.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }))
	flushSync()
}

function keyUp(container: HTMLElement, init: KeyboardEventInit) {
	container.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, ...init }))
	flushSync()
}

function blurWindow() {
	window.dispatchEvent(new Event('blur'))
	flushSync()
}

describe('useDocumentEvents drop handling', () => {
	afterEach(() => {
		cleanupMounted()
	})

	// The container's native drop listener used to stop propagation before the event reached
	// the framework's root, so drop handlers inside the canvas never fired.
	it('lets a drop inside the canvas reach drop handlers there', async () => {
		// Unlike a React handler, a native handler that calls stopPropagation() would keep the
		// event from reaching the container's own listener (which prevents the browser default), so
		// this one only observes the drop.
		const onDrop = vi.fn((_e: DragEvent) => {})
		dropHandlers.onDrop = onDrop
		mounted.push(
			mount(EditorHarness, {
				target: document.body,
				props: { components: { OnTheCanvas: DropTarget } },
			})
		)
		await flush()

		const target = document.querySelector('[data-testid="drop-target"]')!
		expect(target.closest('.tl-canvas')).not.toBeNull()
		const event = new Event('drop', { bubbles: true, cancelable: true })
		Object.defineProperty(event, 'dataTransfer', { value: { files: [], getData: () => '' } })
		target.dispatchEvent(event)
		flushSync()

		expect(onDrop).toHaveBeenCalledTimes(1)
		// the browser default (navigating to the dropped file) is still prevented
		expect(event.defaultPrevented).toBe(true)
	})
})

describe('useDocumentEvents window blur', () => {
	afterEach(() => {
		cleanupMounted()
	})

	// Alt+Tab / Cmd+Tab while holding Space: the keyup goes to the other app, so the editor
	// used to stay in spacebar panning mode with the grab cursor until Space was pressed again.
	it('ends spacebar panning and restores the cursor', async () => {
		const { editor, container } = await renderEditor()
		editor.setCursor({ type: 'cross', rotation: 0 })

		keyDown(container, { key: ' ', code: 'Space' })
		expect(editor.inputs.keys.has('Space')).toBe(true)
		expect(editor.inputs.getIsSpacebarPanning()).toBe(true)
		expect(editor.inputs.getIsPanning()).toBe(true)
		expect(editor.getInstanceState().cursor.type).toBe('grab')

		blurWindow()
		expect(editor.inputs.keys.has('Space')).toBe(false)
		expect(editor.inputs.getIsSpacebarPanning()).toBe(false)
		expect(editor.inputs.getIsPanning()).toBe(false)
		expect(editor.getInstanceState().cursor.type).toBe('cross')
	})

	it('releases every held key through a key_up that tools can match on key', async () => {
		const { editor, container } = await renderEditor()
		const keyUps: TLKeyboardEventInfo[] = []
		editor.on('event', (info) => {
			if (info.type === 'keyboard' && info.name === 'key_up') keyUps.push(info)
		})

		keyDown(container, { key: 'ArrowLeft', code: 'ArrowLeft' })
		keyDown(container, { key: 'a', code: 'KeyA' })
		expect([...editor.inputs.keys]).toEqual(['ArrowLeft', 'KeyA'])

		blurWindow()
		expect(editor.inputs.keys.size).toBe(0)
		expect(keyUps.map((info) => [info.key, info.code])).toEqual([
			['ArrowLeft', 'ArrowLeft'],
			['a', 'KeyA'],
		])
	})

	it('does nothing when no keys are held', async () => {
		const { editor } = await renderEditor()
		const onEvent = vi.fn()
		editor.on('event', onEvent)
		blurWindow()
		expect(onEvent).not.toHaveBeenCalled()
	})
})

// Browsers report `metaKey` as still true on the keyup of Meta itself.
const metaKeyUp: KeyboardEventInit = { key: 'Meta', code: 'MetaLeft', metaKey: true }

describe('useDocumentEvents meta release', () => {
	afterEach(() => {
		cleanupMounted()
	})

	// macOS never delivers the keyup of a non-modifier key pressed while Meta is held, so the
	// arrow from a Cmd+Arrow shortcut stayed held and the next plain arrow nudged diagonally.
	it('releases keys whose keyup macOS swallowed while Meta was held', async () => {
		const { editor, container } = await renderEditor()

		keyDown(container, { key: 'Meta', code: 'MetaLeft', metaKey: true })
		keyDown(container, { key: 'ArrowUp', code: 'ArrowUp', metaKey: true })
		expect([...editor.inputs.keys]).toEqual(['MetaLeft', 'ArrowUp'])

		// no keyup for ArrowUp ever arrives
		keyUp(container, metaKeyUp)
		expect([...editor.inputs.keys]).toEqual([])
	})

	// A key held from before Meta went down still gets its own keyup, so releasing it here
	// would drop a key the user is still holding.
	it('leaves keys held from before Meta went down', async () => {
		const { editor, container } = await renderEditor()

		keyDown(container, { key: ' ', code: 'Space' })
		keyDown(container, { key: 'Meta', code: 'MetaLeft', metaKey: true })
		keyUp(container, metaKeyUp)

		expect([...editor.inputs.keys]).toEqual(['Space'])
	})

	// That key keeps auto-repeating, and once Cmd is down those repeats carry `metaKey`.
	// Counting them would release a key that is still physically down - and a repeat never
	// puts it back, since the editor treats key_repeat as a noop.
	it('leaves a key that was already repeating when Meta went down', async () => {
		const { editor, container } = await renderEditor()

		keyDown(container, { key: 'ArrowUp', code: 'ArrowUp' })
		keyDown(container, { key: 'Meta', code: 'MetaLeft', metaKey: true })
		keyDown(container, { key: 'ArrowUp', code: 'ArrowUp', metaKey: true, repeat: true })
		keyUp(container, metaKeyUp)

		expect([...editor.inputs.keys]).toEqual(['ArrowUp'])
	})

	// Idle.onKeyUp re-enters shape editing on Enter, so replaying a key_up here stole the
	// focus that cmd+Enter's a11y action had just put on the style toolbar.
	it('does not fire tool key_up handlers for the keys it releases', async () => {
		const { editor, container } = await renderEditor()
		const keyUps: TLKeyboardEventInfo[] = []
		editor.on('event', (info) => {
			if (info.type === 'keyboard' && info.name === 'key_up') keyUps.push(info)
		})

		keyDown(container, { key: 'Meta', code: 'MetaLeft', metaKey: true })
		keyDown(container, { key: 'Enter', code: 'Enter', metaKey: true })
		keyUp(container, metaKeyUp)

		expect([...editor.inputs.keys]).toEqual([])
		expect(keyUps.map((info) => info.code)).toEqual(['MetaLeft'])
	})

	// A still-held modifier keeps its own keyup, and reporting it as up would start the
	// editor's 150ms release: `ShiftLeft` would leave `inputs.keys` and shrink the nudge step.
	it('leaves a still-held modifier alone', async () => {
		const { editor, container } = await renderEditor()

		keyDown(container, { key: 'Shift', code: 'ShiftLeft', shiftKey: true })
		keyDown(container, { key: 'Meta', code: 'MetaLeft', shiftKey: true, metaKey: true })
		keyDown(container, { key: 'ArrowUp', code: 'ArrowUp', shiftKey: true, metaKey: true })

		keyUp(container, { ...metaKeyUp, shiftKey: true })
		expect([...editor.inputs.keys]).toEqual(['ShiftLeft'])

		await flush(200)
		expect([...editor.inputs.keys]).toEqual(['ShiftLeft'])
		expect(editor.inputs.getShiftKey()).toBe(true)
	})

	// Letting go of Cmd while still holding the arrow: the arrow is dropped as owed a keyup,
	// but it is genuinely down, and its repeats say so. Without this, nudging stopped dead
	// mid-gesture and stayed dead for as long as the key was held.
	it('takes back a dropped key that is still repeating', async () => {
		const { editor, container } = await renderEditor()

		keyDown(container, { key: 'Meta', code: 'MetaLeft', metaKey: true })
		keyDown(container, { key: 'ArrowUp', code: 'ArrowUp', metaKey: true })
		keyUp(container, metaKeyUp)
		expect([...editor.inputs.keys]).toEqual([])

		keyDown(container, { key: 'ArrowUp', code: 'ArrowUp', repeat: true })
		expect([...editor.inputs.keys]).toEqual(['ArrowUp'])
	})

	it('does not disturb keys held without Meta', async () => {
		const { editor, container } = await renderEditor()

		keyDown(container, { key: 'ArrowUp', code: 'ArrowUp' })
		keyUp(container, { key: 'ArrowUp', code: 'ArrowUp' })
		keyDown(container, { key: 'ArrowRight', code: 'ArrowRight' })

		expect([...editor.inputs.keys]).toEqual(['ArrowRight'])
	})

	// Browsers report `metaKey: true` on Meta's own keyup, which left `getMetaKey()` true
	// until some later event happened to report it false.
	it('releases meta itself, though its keyup reports metaKey as still down', async () => {
		const { editor, container } = await renderEditor()

		keyDown(container, { key: 'Meta', code: 'MetaLeft', metaKey: true })
		expect(editor.inputs.getMetaKey()).toBe(true)

		keyUp(container, metaKeyUp)
		await flush(200)
		expect(editor.inputs.getMetaKey()).toBe(false)
	})
})
