import { Editor } from '@svelte-draw/editor'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { version } from './editorInternals'
import SvelteDrawEditor from './SvelteDrawEditor.svelte'
import EditorWithChildren from './testing/EditorWithChildren.svelte'
import StubCanvas from './testing/StubCanvas.svelte'
import type { SvelteDrawEditorProps } from './types'

describe('SvelteDrawEditor', () => {
	let target: HTMLElement
	let component: ReturnType<typeof mount> | undefined

	const baseProps = {
		options: { maxFontsToLoadBeforeRender: 0 },
		components: { Canvas: StubCanvas },
	} satisfies SvelteDrawEditorProps

	function render(props: SvelteDrawEditorProps = baseProps) {
		component = mount(SvelteDrawEditor, { target, props })
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

	it('renders the container markup', () => {
		render({ ...baseProps, className: 'my-class' })
		const container = target.querySelector<HTMLElement>('.tl-container')!
		expect(container.classList.contains('tl-theme__light')).toBe(true)
		expect(container.classList.contains('my-class')).toBe(true)
		expect(container.getAttribute('data-svelte-draw')).toBe(version)
		expect(container.getAttribute('role')).toBe('application')
		expect(container.getAttribute('tabindex')).toBe('-1')
		expect(container.getAttribute('draggable')).toBe('false')
		expect(container.getAttribute('aria-label')).toBe('svelte-draw')
	})

	it('renders the portal host after the canvas, as the last element the component renders', () => {
		render()
		const container = target.querySelector<HTMLElement>('.tl-container')!
		const host = container.querySelector('.tl-portal-host')!
		const canvas = container.querySelector('[data-testid="stub-canvas"]')!
		expect(canvas.compareDocumentPosition(host) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		// the only thing after it is the text measurement element the editor itself appends
		const after = Array.from(container.children).slice(
			Array.from(container.children).indexOf(host) + 1
		)
		expect(after.every((el) => el.classList.contains('tl-text-measure'))).toBe(true)
	})

	it('creates an editor, renders the canvas and calls onMount with it', () => {
		const onMount = vi.fn()
		render({ ...baseProps, onMount })
		expect(target.querySelector('[data-testid="stub-canvas"]')).not.toBeNull()
		expect(onMount).toHaveBeenCalledTimes(1)
		expect(onMount.mock.calls[0][0]).toBeInstanceOf(Editor)
		expect(window.svelteDrawReady).toBe(true)
	})

	it('runs the onMount teardown and disposes the editor when unmounted', () => {
		const teardown = vi.fn()
		let editor: Editor | undefined
		render({
			...baseProps,
			onMount: (e) => {
				editor = e
				return teardown
			},
		})
		expect(teardown).not.toHaveBeenCalled()
		unmount(component!)
		component = undefined
		flushSync()
		expect(teardown).toHaveBeenCalledTimes(1)
		expect(editor!.isDisposed).toBe(true)
	})

	it('renders children instead of the canvas', () => {
		component = mount(EditorWithChildren, { target, props: { editorProps: baseProps } })
		flushSync()
		expect(target.querySelector('[data-testid="custom-child"]')).not.toBeNull()
		expect(target.querySelector('[data-testid="stub-canvas"]')).toBeNull()
	})

	it('applies the dark theme class when the color scheme is dark', () => {
		render({ ...baseProps, colorScheme: 'dark' })
		const container = target.querySelector<HTMLElement>('.tl-container')!
		expect(container.classList.contains('tl-theme__dark')).toBe(true)
		expect(container.classList.contains('tl-theme__light')).toBe(false)
		expect(container.getAttribute('data-color-mode')).toBe('dark')
	})

	it('shows the error fallback when the store failed to load', () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
		render({ ...baseProps, store: { status: 'error', error: new Error('boom') } })
		expect(target.querySelector('.tl-error-boundary')).not.toBeNull()
		expect(target.textContent).toContain('Something went wrong')
		consoleError.mockRestore()
	})

	describe('recreating the editor', () => {
		function renderReactive(initial: SvelteDrawEditorProps) {
			const state = $state<SvelteDrawEditorProps>({ ...initial })
			const editors: Editor[] = []
			state.onMount = (editor) => {
				editors.push(editor)
			}
			component = mount(SvelteDrawEditor, { target, props: state })
			flushSync()
			return { state, editors }
		}

		it('keeps the editor when options are replaced by a deeply equal object', () => {
			const { state, editors } = renderReactive({
				...baseProps,
				options: { maxFontsToLoadBeforeRender: 0, camera: { isLocked: false } },
			})
			expect(editors).toHaveLength(1)
			state.options = { maxFontsToLoadBeforeRender: 0, camera: { isLocked: false } }
			flushSync()
			expect(editors).toHaveLength(1)
		})

		it('recreates the editor when a nested option changes', () => {
			const { state, editors } = renderReactive({
				...baseProps,
				options: { maxFontsToLoadBeforeRender: 0, camera: { isLocked: false } },
			})
			expect(editors).toHaveLength(1)
			state.options = { maxFontsToLoadBeforeRender: 0, camera: { isLocked: true } }
			flushSync()
			expect(editors[0].isDisposed).toBe(true)
		})

		it('lets options.camera win over the deprecated cameraOptions prop', () => {
			const { editors } = renderReactive({
				...baseProps,
				cameraOptions: { isLocked: false },
				options: { maxFontsToLoadBeforeRender: 0, camera: { isLocked: true } },
			})
			expect(editors[0].getCameraOptions().isLocked).toBe(true)
		})
	})
})
