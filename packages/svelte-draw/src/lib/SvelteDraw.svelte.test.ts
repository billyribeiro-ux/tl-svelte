import {
	BaseBoxShapeUtil,
	Editor,
	StateNode,
	type TLStateNodeConstructor,
} from '@svelte-draw/editor'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SvelteDrawProps } from './SvelteDraw.svelte'
import SvelteDrawWithChild from './testing/SvelteDrawWithChild.svelte'

// Same options the editor's own tests use: don't wait for fonts before rendering.
const baseOptions = { maxFontsToLoadBeforeRender: 0 }

class FakeShapeUtil1 extends BaseBoxShapeUtil<any> {
	static override type = 'fake' as const
	override getDefaultProps() {
		throw new Error('Method not implemented.')
	}
	override component(_: any): never {
		throw new Error('Method not implemented.')
	}
	override getIndicatorPath(_: any): undefined {
		throw new Error('Method not implemented.')
	}
}
class FakeShapeUtil2 extends BaseBoxShapeUtil<any> {
	static override type = 'fake' as const
	override getDefaultProps() {
		throw new Error('Method not implemented.')
	}
	override component(_: any): never {
		throw new Error('Method not implemented.')
	}
	override getIndicatorPath(_: any): undefined {
		throw new Error('Method not implemented.')
	}
}

// Create a custom tool that overrides a default tool
class CustomSelectTool extends StateNode {
	static override id = 'select' // This should override the default select tool
	static override initial = 'idle'
	static override children(): TLStateNodeConstructor[] {
		return [CustomIdleState]
	}
}

class CustomIdleState extends StateNode {
	static override id = 'idle'
}

// Create a custom tool that doesn't conflict with defaults
class CustomTool extends StateNode {
	static override id = 'custom-tool'
	static override initial = 'idle'
	static override children(): TLStateNodeConstructor[] {
		return [CustomToolIdleState]
	}
}

class CustomToolIdleState extends StateNode {
	static override id = 'idle'
}

describe('<SvelteDraw />', () => {
	let target: HTMLElement
	let component: ReturnType<typeof mount> | undefined

	function render(drawProps: SvelteDrawProps, childTestId?: string) {
		component = mount(SvelteDrawWithChild, { target, props: { drawProps, childTestId } })
		flushSync()
	}

	// Renders `<SvelteDraw hideUi>` and resolves with the mounted editor.
	async function renderWithEditor(drawProps: Partial<SvelteDrawProps> = {}, childTestId?: string) {
		let editor: Editor | undefined
		render(
			{
				options: baseOptions,
				...drawProps,
				onMount: (e) => {
					editor = e
				},
			} as SvelteDrawProps,
			childTestId
		)
		await vi.waitFor(() => expect(editor).toBeDefined())
		return { editor: editor! }
	}

	function press(key: string, code: string, init: KeyboardEventInit = {}) {
		document.body.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true, ...init }))
		document.body.dispatchEvent(new KeyboardEvent('keyup', { key, code, bubbles: true, ...init }))
		flushSync()
	}

	beforeEach(() => {
		target = document.createElement('div')
		document.body.appendChild(target)
	})
	afterEach(() => {
		if (component) unmount(component)
		component = undefined
		target.remove()
	})

	it('Renders without crashing', async () => {
		render({ options: baseOptions }, 'canvas-1')
		await vi.waitFor(() => expect(target.querySelector('[data-testid="canvas-1"]')).not.toBeNull())
	})

	it('Doesnt cause re-render loops with unstable shape utils + tools', async () => {
		let mounts = 0
		render(
			{ options: baseOptions, onMount: () => void mounts++, shapeUtils: [], tools: [] },
			'canvas-1'
		)
		await vi.waitFor(() => expect(target.querySelector('[data-testid="canvas-1"]')).not.toBeNull())
		expect(mounts).toBe(1)
	})

	it('Doesnt cause re-render loops when shape utils change', async () => {
		const props = $state<{ drawProps: SvelteDrawProps; childTestId: string }>({
			drawProps: { options: baseOptions, shapeUtils: [FakeShapeUtil1] },
			childTestId: 'canvas-1',
		})
		component = mount(SvelteDrawWithChild, { target, props })
		flushSync()
		await vi.waitFor(() => expect(target.querySelector('[data-testid="canvas-1"]')).not.toBeNull())

		props.drawProps = { options: baseOptions, shapeUtils: [FakeShapeUtil2] }
		props.childTestId = 'canvas-2'
		flushSync()
		await vi.waitFor(() => expect(target.querySelector('[data-testid="canvas-2"]')).not.toBeNull())
	})

	it('correctly merges custom tools with default tools, allowing custom tools to override defaults', async () => {
		const { editor } = await renderWithEditor({ tools: [CustomSelectTool, CustomTool] })

		// Verify that the custom select tool overrides the default select tool
		expect(editor.root.children!['select']).toBeInstanceOf(CustomSelectTool)

		// Verify that the custom tool is also available
		expect(editor.root.children!['custom-tool']).toBeInstanceOf(CustomTool)

		// Verify that other default tools are still available
		expect(editor.root.children!['eraser']).toBeDefined()
		expect(editor.root.children!['hand']).toBeDefined()
		expect(editor.root.children!['zoom']).toBeDefined()
	})

	it('keyboard shortcuts work when hideUi is true', async () => {
		const { editor } = await renderWithEditor({ hideUi: true })

		// Focus the editor so keyboard shortcuts are active
		editor.focus()

		// Start on select tool
		expect(editor.getCurrentToolId()).toBe('select')

		press('d', 'KeyD')

		// Should now be on draw tool
		expect(editor.getCurrentToolId()).toBe('draw')

		press('h', 'KeyH')

		// Should now be on hand tool
		expect(editor.getCurrentToolId()).toBe('hand')
	})

	it('matches typed-character shortcuts on alternative Latin layouts (Dvorak)', async () => {
		const { editor } = await renderWithEditor({ hideUi: true })

		editor.focus()

		// Dvorak's 'd' lives at the physical position QWERTY calls 'KeyH'. The user typed 'd';
		// matching by typed character (event.key) selects the draw tool regardless of physical position.
		press('d', 'KeyH')
		expect(editor.getCurrentToolId()).toBe('draw')

		// Dvorak's 'e' lives at the physical position QWERTY calls 'KeyD'.
		press('e', 'KeyD')
		expect(editor.getCurrentToolId()).toBe('eraser')
	})

	it('falls back to physical key for non-Latin layouts (Cyrillic)', async () => {
		const { editor } = await renderWithEditor({ hideUi: true })

		editor.focus()

		// Cyrillic users pressing the physical KeyA position type 'ф'. Since the typed character
		// has no ASCII shortcut, we fall back to event.code's US-QWERTY equivalent ('a') — which
		// activates the arrow tool just as it would on a QWERTY keyboard.
		press('ф', 'KeyA')
		expect(editor.getCurrentToolId()).toBe('arrow')
	})

	it('matches modifier shortcuts (cmd/ctrl) regardless of layout', async () => {
		const { editor } = await renderWithEditor({ hideUi: true })

		editor.focus()

		editor.createShape({ id: 'shape:test' as any, type: 'geo', x: 0, y: 0 })
		expect(editor.getCurrentPageShapeIds().size).toBe(1)

		press('z', 'KeyZ', { metaKey: true })

		// cmd+z should undo the shape creation (kbd is 'cmd+z,ctrl+z')
		expect(editor.getCurrentPageShapeIds().size).toBe(0)
	})

	it('matches the comma key for the temporary zoom shortcut on Dvorak', async () => {
		const { editor } = await renderWithEditor({ hideUi: true })

		editor.focus()

		// Dvorak's comma is at the physical KeyW position. With layout-independent matching by
		// event.code (the v4 hotkeys-js bug) the library would read this as 'w' and the comma
		// zoom would never engage. We match by typed character so the registered ',' shortcut
		// fires correctly.
		document.body.dispatchEvent(
			new KeyboardEvent('keydown', { key: ',', code: 'KeyW', bubbles: true })
		)
		flushSync()
		expect(editor.inputs.keys.has('Comma')).toBe(true)

		document.body.dispatchEvent(
			new KeyboardEvent('keyup', { key: ',', code: 'KeyW', bubbles: true })
		)
		flushSync()
		expect(editor.inputs.keys.has('Comma')).toBe(false)
	})

	it('does not fire shortcuts when typing into a textarea', async () => {
		const { editor } = await renderWithEditor({ hideUi: true })

		editor.focus()

		expect(editor.getCurrentToolId()).toBe('select')

		const textarea = document.createElement('textarea')
		document.body.appendChild(textarea)
		try {
			textarea.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'd', code: 'KeyD', bubbles: true })
			)
			textarea.dispatchEvent(new KeyboardEvent('keyup', { key: 'd', code: 'KeyD', bubbles: true }))
			flushSync()
			// Should remain on select tool — the shortcut is filtered out for textarea targets.
			expect(editor.getCurrentToolId()).toBe('select')
		} finally {
			textarea.remove()
		}
	})

	// The adapter used to come from the provider `SvelteDraw` renders above the editor, whose locale is
	// fixed at mount, so shapes kept announcing themselves in the first language after a switch. 'zz'
	// is a locale the SDK ships no catalog for, so nothing is fetched.
	it("keeps the editor's i18n on the user's current locale", async () => {
		const { editor } = await renderWithEditor()
		expect(editor.i18n().locale).toBe('en')

		editor.user.updateUserPreferences({ locale: 'zz' })
		flushSync()
		expect(editor.i18n().locale).toBe('zz')
	})
})
