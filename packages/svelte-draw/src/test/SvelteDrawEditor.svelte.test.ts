import {
	BaseBoxShapeTool,
	BaseBoxShapeUtil,
	Editor,
	type IndexKey,
	type TLAssetStore,
	type TLShape,
	type TLShapeId,
	createShapeId,
	createTLStore,
	noop,
	react,
	shapeView,
	tleditors,
	toRichText,
} from '@svelte-draw/editor'
import { SvelteDrawEditor, type SvelteDrawEditorProps } from '@svelte-draw/svelte'
import { flushSync, mount, unmount } from 'svelte'
import { vi } from 'vitest'
import { defaultShapeUtils } from '../lib/defaultShapeUtils'
import { defaultTools } from '../lib/defaultTools'
import SvelteDraw, { type SvelteDrawProps } from '../lib/SvelteDraw.svelte'
import { createDrawSegments } from '../lib/utils/test-helpers'
import { defaultAddFontsFromNode, tipTapDefaultExtensions } from '../lib/utils/text/richText'
import CardShapeView from './svelte/CardShape.svelte'
import EditorWithUi from './svelte/EditorWithUi.svelte'
import EditorWithUiContext from './svelte/EditorWithUiContext.svelte'
import { flush } from './svelte/helpers'
import RecordingErrorFallback, { fallbackErrors } from './svelte/RecordingErrorFallback.svelte'
import { act } from './testutils/renderSvelteDrawComponent'

function checkAllShapes(editor: Editor, shapes: string[]) {
	expect(Object.keys(editor!.shapeUtils)).toStrictEqual(shapes)
}

const options = {
	text: {
		addFontsFromNode: defaultAddFontsFromNode,
		tipTapConfig: {
			extensions: tipTapDefaultExtensions,
		},
	},
}

// The Svelte counterpart of RTL's `render` + `rerender`: the props are mounted as reactive state,
// so assigning to them (`rendered.props.options = ...`) is a re-render with new props.
interface Rendered<P extends object> {
	props: P
	target: HTMLElement
	unmount(): void
}

class Cell {
	value = $state.raw<unknown>(undefined)
}

const mounted: Array<() => void> = []

afterEach(() => {
	for (const cleanup of mounted.splice(0).reverse()) cleanup()
})

async function renderComponent<P extends object>(
	Component: any,
	initialProps: P,
	{
		waitForPatterns = false,
		waitForCanvas = true,
	}: { waitForPatterns?: boolean; waitForCanvas?: boolean } = {}
): Promise<Rendered<P>> {
	const target = document.createElement('div')
	document.body.appendChild(target)
	// One raw signal per prop (not a deep `$state` proxy: that breaks values handed to the store,
	// such as a snapshot). Assigning to `props` replaces one key and notifies only its readers, so
	// unchanged props keep their identity, as they do across a React re-render.
	const cells = new Map<string | symbol, Cell>()
	let keys = $state.raw<Array<string | symbol>>([])
	const cell = (key: string | symbol) => {
		let c = cells.get(key)
		if (!c) cells.set(key, (c = new Cell()))
		return c
	}
	const write = (key: string | symbol, value: unknown) => {
		if (!cells.has(key)) keys = [...keys, key]
		cell(key).value = value
	}
	for (const [key, value] of Object.entries(initialProps)) write(key, value)
	const view = new Proxy({} as P, {
		get: (_, key) => cell(key).value,
		has: (_, key) => keys.includes(key),
		ownKeys: () => keys,
		getOwnPropertyDescriptor: (_, key) =>
			keys.includes(key)
				? { enumerable: true, configurable: true, value: cell(key).value }
				: undefined,
	})
	const props = new Proxy({} as P, {
		get: (_, key) => cell(key).value,
		set: (_, key, value) => {
			write(key, value)
			return true
		},
	})
	const component = mount(Component, { target, props: view })
	flushSync()
	let done = false
	const cleanup = () => {
		if (done) return
		done = true
		unmount(component)
		target.remove()
	}
	mounted.push(cleanup)
	// An editor given children renders no canvas of its own.
	if (waitForCanvas) {
		await vi.waitFor(() => expect(target.querySelector('[data-testid="canvas"]')).not.toBeNull(), {
			timeout: 5000,
		})
	}
	if (waitForPatterns) {
		await vi.waitFor(
			() => expect(target.querySelector('[data-testid="ready-pattern-fill-defs"]')).not.toBeNull(),
			{ timeout: 5000 }
		)
	}
	return { props, target, unmount: cleanup }
}

interface RenderOpts {
	waitForPatterns?: boolean
	waitForCanvas?: boolean
}
const renderEditor = (props: SvelteDrawEditorProps, opts?: RenderOpts) =>
	renderComponent(SvelteDrawEditor, props, opts)
const renderSvelteDraw = (props: Partial<SvelteDrawProps>, opts?: RenderOpts) =>
	renderComponent(SvelteDraw, props, opts)

const findAllByTestId = (target: HTMLElement, id: string) =>
	vi.waitFor(
		() => {
			const els = target.querySelectorAll(`[data-testid="${id}"]`)
			if (!els.length) throw new Error(`no element with data-testid=${id}`)
			return [...els]
		},
		{ timeout: 5000 }
	)

describe('<SvelteDrawEditor />', () => {
	it('Renders without crashing', async () => {
		const rendered = await renderEditor({ tools: defaultTools, initialState: 'select' })
		expect(await findAllByTestId(rendered.target, 'canvas')).not.toHaveLength(0)
	})

	it('Creates its own store with core shapes', async () => {
		let editor: Editor
		await renderEditor({
			onMount: (e) => {
				editor = e
			},
			initialState: 'select',
			tools: defaultTools,
		})
		checkAllShapes(editor!, ['group'])
	})

	it('Can be created with default shapes', async () => {
		let editor: Editor
		await renderEditor({
			shapeUtils: [],
			tools: defaultTools,
			initialState: 'select',
			onMount: (e) => {
				editor = e
			},
		})
		expect(editor!).toBeTruthy()

		checkAllShapes(editor!, ['group'])
	})

	it('Renders with an external store', async () => {
		const store = createTLStore({ shapeUtils: [], bindingUtils: [] })
		const onMount = vi.fn((editor: Editor) => {
			expect(editor.store).toBe(store)
		})
		await renderEditor({ store, tools: defaultTools, initialState: 'select', onMount })
		// the assertion above runs inside onMount, so make sure it ran
		expect(onMount).toHaveBeenCalledTimes(1)
	})

	it('runs the teardown returned by the store onMount option when unmounted', async () => {
		const teardown = vi.fn()
		const storeOnMount = vi.fn(() => teardown)
		const store = createTLStore({ shapeUtils: [], bindingUtils: [], onMount: storeOnMount })
		const rendered = await renderEditor({ store, tools: defaultTools, initialState: 'select' })
		expect(storeOnMount).toHaveBeenCalledTimes(1)
		expect(teardown).not.toHaveBeenCalled()

		await act(() => rendered.unmount())
		expect(teardown).toHaveBeenCalledTimes(1)
	})

	it('throws if the store has different shapes to the ones passed in', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(noop)
		// expect(() =>
		// 	render(
		// 		<SvelteDrawEditor
		// 			shapeUtils={[GroupShapeUtil]}
		// 			store={createTLStore({ shapeUtils: [] })}
		// 			components={{
		// 				ErrorFallback: ({ error }) => {
		// 					throw error
		// 				},
		// 			}}
		// 		>
		// 			<div data-testid="canvas-1" />
		// 		</SvelteDrawEditor>
		// 	)
		// ).toThrowErrorMatchingInlineSnapshot(
		// 	`"Editor and store have different shapes: \\"draw\\" was passed into the editor but not the schema"`
		// )

		// 	expect(() =>
		// 		render(
		// 			<SvelteDrawEditor
		// 				store={createTLStore({ shapeUtils: [GroupShapeUtil] })}
		// 				components={{
		// 					ErrorFallback: ({ error }) => {
		// 						throw error
		// 					},
		// 				}}
		// 			>
		// 				<div data-testid="canvas-1" />
		// 			</SvelteDrawEditor>
		// 		)
		// 	).toThrowErrorMatchingInlineSnapshot(
		// 		`"Editor and store have different shapes: \\"draw\\" is present in the store schema but not provided to the editor"`
		// 	)
		spy.mockRestore()
	})

	it('Accepts fresh versions of store and calls `onMount` for each one', async () => {
		const initialStore = createTLStore({ shapeUtils: [], bindingUtils: [] })
		const onMount = vi.fn()
		const rendered = await renderEditor({
			initialState: 'select',
			tools: defaultTools,
			store: initialStore,
			onMount,
		})
		const initialEditor = onMount.mock.lastCall![0]
		vi.spyOn(initialEditor, 'dispose')
		expect(initialEditor.store).toBe(initialStore)
		// re-render with the same store:
		rendered.props.store = initialStore
		flushSync()
		// not called again:
		expect(onMount).toHaveBeenCalledTimes(1)
		// re-render with a new store:
		const newStore = createTLStore({ shapeUtils: [], bindingUtils: [] })
		rendered.props.store = newStore
		await flush()
		await findAllByTestId(rendered.target, 'canvas')
		expect(initialEditor.dispose).toHaveBeenCalledTimes(1)
		expect(onMount).toHaveBeenCalledTimes(2)
		expect(onMount.mock.lastCall![0].store).toBe(newStore)
	})

	it('keeps the editor when re-rendered with equal inline nested options', async () => {
		const onMount = vi.fn()
		const rendered = await renderEditor({
			tools: defaultTools,
			initialState: 'select',
			onMount,
			options: { camera: { isLocked: true }, deepLinks: { param: 'd' } },
		})
		const initialEditor = onMount.mock.lastCall![0]
		vi.spyOn(initialEditor, 'dispose')
		// a fresh options object with fresh (but equal) nested objects, as an inline literal gives:
		rendered.props.options = { camera: { isLocked: true }, deepLinks: { param: 'd' } }
		await flush()
		expect(initialEditor.dispose).not.toHaveBeenCalled()
		// deeper nesting (camera constraints, zoomSteps) is compared by value too:
		const withConstraints = () => ({
			camera: {
				isLocked: true,
				zoomSteps: [0.5, 1, 2],
				constraints: {
					bounds: { x: 0, y: 0, w: 100, h: 100 },
					padding: { x: 0, y: 0 },
					origin: { x: 0.5, y: 0.5 },
					initialZoom: 'default' as const,
					baseZoom: 'default' as const,
					behavior: 'contain' as const,
				},
			},
			deepLinks: { param: 'd' },
		})
		rendered.props.options = withConstraints()
		await flush()
		await findAllByTestId(rendered.target, 'canvas')
		expect(onMount).toHaveBeenCalledTimes(2)
		const secondEditor = onMount.mock.lastCall![0]
		vi.spyOn(secondEditor, 'dispose')
		rendered.props.options = withConstraints()
		await flush()
		expect(secondEditor.dispose).not.toHaveBeenCalled()
		// a real change still recreates the editor:
		rendered.props.options = { camera: { isLocked: false }, deepLinks: { param: 'd' } }
		await flush()
		await findAllByTestId(rendered.target, 'canvas')
		expect(secondEditor.dispose).toHaveBeenCalledTimes(1)
		expect(onMount).toHaveBeenCalledTimes(3)
		expect(onMount.mock.lastCall![0].getCameraOptions().isLocked).toBe(false)
	})

	it('keeps the editor when re-rendered with equal inline gridSteps', async () => {
		const onMount = vi.fn()
		const gridSteps = () => [{ min: -1, mid: 0.15, step: 64 }]
		const rendered = await renderEditor({
			tools: defaultTools,
			initialState: 'select',
			onMount,
			options: { gridSteps: gridSteps() },
		})
		const initialEditor = onMount.mock.lastCall![0]
		vi.spyOn(initialEditor, 'dispose')
		rendered.props.options = { gridSteps: gridSteps() }
		await flush()
		expect(initialEditor.dispose).not.toHaveBeenCalled()
		// a real change still recreates the editor:
		rendered.props.options = { gridSteps: [{ min: -1, mid: 0.15, step: 32 }] }
		await flush()
		await findAllByTestId(rendered.target, 'canvas')
		expect(initialEditor.dispose).toHaveBeenCalledTimes(1)
		expect(onMount).toHaveBeenCalledTimes(2)
		expect(onMount.mock.lastCall![0].options.gridSteps).toEqual([{ min: -1, mid: 0.15, step: 32 }])
	})

	it('keeps the editor when <SvelteDraw /> is re-rendered with equal inline text options', async () => {
		// <SvelteDraw> builds a fresh `tipTapConfig` from `options.text` each time that object changes
		// identity, so a shallow comparison of `text` is not enough here.
		const onMount = vi.fn()
		const rendered = await renderSvelteDraw(
			{ onMount, options: { text: {} } },
			{ waitForPatterns: true }
		)
		const initialEditor = onMount.mock.lastCall![0]
		vi.spyOn(initialEditor, 'dispose')
		rendered.props.options = { text: {} }
		await flush()
		expect(initialEditor.dispose).not.toHaveBeenCalled()
		// a real change still recreates the editor:
		const addFontsFromNode = vi.fn(defaultAddFontsFromNode)
		rendered.props.options = { text: { addFontsFromNode } }
		await flush()
		await findAllByTestId(rendered.target, 'canvas')
		expect(initialEditor.dispose).toHaveBeenCalledTimes(1)
		expect(onMount).toHaveBeenCalledTimes(2)
		expect(onMount.mock.lastCall![0].getTextOptions().addFontsFromNode).toBe(addFontsFromNode)
	})

	it('reflects mount state via getIsMounted and the mount/unmount events', async () => {
		const onUnmount = vi.fn()
		const onMount = vi.fn()
		const rendered = await renderEditor({ tools: defaultTools, initialState: 'select', onMount })
		const editor: Editor = onMount.mock.lastCall![0]
		editor.on('unmount', onUnmount)

		// mounted after render:
		expect(editor.getIsMounted()).toBe(true)
		expect(tleditors.getMounted()).toEqual([editor])

		// getIsMounted is reactive:
		const mountedValues: boolean[] = []
		const stop = react('track mounted', () => mountedValues.push(editor.getIsMounted()))

		await act(() => rendered.unmount())

		// the unmount event fired and the mounted state flipped back to false:
		expect(onUnmount).toHaveBeenCalledTimes(1)
		expect(editor.getIsMounted()).toBe(false)
		expect(tleditors.getMounted()).toEqual([])
		expect(mountedValues).toEqual([true, false])

		stop()
	})

	it('Renders the canvas and shapes', async () => {
		let editor = {} as Editor
		// Inside the UI context: the React suite mocked `useBreakpoint` / `useTranslation` globally
		// (setupVitest.js) so frame labels could render without it; the Svelte functions have no
		// such mock, so provide the real context instead.
		await renderComponent(EditorWithUiContext, {
			editorProps: {
				shapeUtils: defaultShapeUtils,
				initialState: 'select',
				tools: defaultTools,
				onMount: (editorApp: Editor) => {
					editor = editorApp
				},
				options,
			},
		})

		expect(editor).toBeTruthy()
		await act(() => {
			editor.updateInstanceState({ screenBounds: { x: 0, y: 0, w: 1080, h: 720 } })
		})

		// Test all shape types except group
		const shapeTypesToTest = [
			{ type: 'arrow' as const, props: { start: { x: 0, y: 0 }, end: { x: 100, y: 100 } } },
			{ type: 'bookmark' as const, props: { w: 100, h: 100, url: 'https://example.com' } },
			{
				type: 'draw' as const,
				props: { segments: createDrawSegments([[{ x: 0, y: 0, z: 0.5 }]]) },
			},
			{ type: 'embed' as const, props: { w: 100, h: 100, url: 'https://example.com' } },
			{ type: 'frame' as const, props: { w: 100, h: 100 } },
			{ type: 'geo' as const, props: { w: 100, h: 100, geo: 'rectangle' as const } },
			{
				type: 'highlight' as const,
				props: { segments: createDrawSegments([[{ x: 0, y: 0, z: 0.5 }]]) },
			},
			{ type: 'image' as const, props: { w: 100, h: 100 } },
			{
				type: 'line' as const,
				props: {
					points: {
						a1: { id: 'a1', index: 'a1' as IndexKey, x: 0, y: 0 },
						a2: { id: 'a2', index: 'a2' as IndexKey, x: 100, y: 100 },
					},
				},
			},
			{ type: 'note' as const, props: { richText: toRichText('test') } },
			{ type: 'text' as const, props: { w: 100, richText: toRichText('test') } },
			{ type: 'video' as const, props: { w: 100, h: 100 } },
		]

		const shapeIds: TLShapeId[] = []

		for (let i = 0; i < shapeTypesToTest.length; i++) {
			const shapeConfig = shapeTypesToTest[i]
			const id = createShapeId()
			shapeIds.push(id)

			await act(() => {
				editor.createShapes([
					{
						id,
						...shapeConfig,
						x: i * 150, // Space them out horizontally
						y: 0,
					},
				])
			})

			// Does the shape exist?
			const shape = editor.getShape(id)
			expect(shape).toBeTruthy()
			expect(shape?.type).toBe(shapeConfig.type)

			// Check that all shapes rendered without error boundaries
			expect(
				document.querySelectorAll('.tl-shape-error-boundary'),
				`${shapeConfig.type} had an error while rendering`
			).toHaveLength(0)
		}

		// Check that all shape components are rendering
		expect(document.querySelectorAll('.tl-shape').length).toBeGreaterThanOrEqual(
			shapeTypesToTest.length
		)

		// Check that the canvas overlays element is present (indicators render here too)
		expect(document.querySelector('.tl-canvas-overlays')).toBeTruthy()

		// Select one of the shapes (the note shape)
		const noteShapeId = shapeIds[9] // note is at index 9
		await act(() => editor.select(noteShapeId))

		expect(editor.getSelectedShapeIds().length).toBe(1)
		expect(editor.getSelectedShapeIds()[0]).toBe(noteShapeId)

		// Select the eraser tool...
		await act(() => editor.setCurrentTool('eraser'))

		// Is the editor's current tool correct?
		expect(editor.getCurrentToolId()).toBe('eraser')
	})

	it('Renders selection overlays without SvelteDrawUiContextProvider', async () => {
		// The React version unmocked `useTranslation` here, because setupVitest.js mocks it globally.
		// There is no such mock for the Svelte translation function, so the real one is exercised.
		fallbackErrors.length = 0
		let editor = {} as Editor
		await renderEditor({
			shapeUtils: defaultShapeUtils,
			initialState: 'select',
			tools: defaultTools,
			components: {
				// Use a custom error fallback to detect errors that would
				// otherwise be silently caught by the default error boundary
				ErrorFallback: RecordingErrorFallback,
			},
			onMount: (editorApp) => {
				editor = editorApp
			},
			options,
		})

		await act(() => {
			editor.updateInstanceState({ screenBounds: { x: 0, y: 0, w: 1080, h: 720 } })
		})

		const id = createShapeId()
		await act(() => {
			editor.createShapes([
				{
					id,
					type: 'geo',
					props: { w: 100, h: 100 },
				},
			])
		})

		// Select the shape — this triggers the selection foreground to render
		// with resize/rotate handles that use the translation function
		await act(() => editor.select(id))

		expect(editor.getSelectedShapeIds()).toHaveLength(1)
		// Verify no errors were caught by the error boundary
		// (the translation function would throw without the fix, which the error boundary catches)
		expect(fallbackErrors).toHaveLength(0)
		expect(document.querySelector('[data-testid="test-error-fallback"]')).toBeNull()
		// Selection foreground is now rendered via the OverlayUtil canvas system,
		// so we verify via the canvas-overlays element instead of the old SVG element
		expect(document.querySelector('.tl-canvas-overlays')).toBeTruthy()
	})

	// React's <StrictMode> double-invokes effects, which could create two editors. Svelte has no
	// strict mode, so this checks the equivalent guarantee: one mount creates exactly one editor,
	// and onMount is handed that same instance.
	it('creates a single editor instance on mount', async () => {
		const editorInstances = new Set<Editor>()
		const onMount = vi.fn((editor: Editor) => {
			editorInstances.add(editor)
		})
		await renderEditor({ tools: defaultTools, initialState: 'select', onMount })

		// we should only get one editor instance
		expect(editorInstances.size).toBe(1)
		expect(onMount).toHaveBeenCalled()
	})

	it('allows updating the deprecated cameraOptions prop without re-creating the editor', async () => {
		// `options.camera` is part of `options`, so changing it recreates the editor; only the
		// deprecated prop is applied in place.
		const onMount = vi.fn()
		const renderer = await renderEditor({ onMount })
		const editor: Editor = onMount.mock.lastCall![0]
		vi.spyOn(editor, 'dispose')
		expect(editor.getCameraOptions().isLocked).toBe(false)

		// eslint-disable-next-line @typescript-eslint/no-deprecated
		renderer.props.cameraOptions = { isLocked: true }
		await flush()
		expect(editor.dispose).not.toHaveBeenCalled()
		expect(editor.getCameraOptions().isLocked).toBe(true)
	})

	it('keeps the editor when re-rendered with equal deprecated textOptions and deepLinks props', async () => {
		const registerDeepLinkListener = vi.spyOn(Editor.prototype, 'registerDeepLinkListener')
		const addFontsFromNode = vi.fn(defaultAddFontsFromNode)
		const onMount = vi.fn()
		const textOptionsProps = () => ({
			onMount,
			textOptions: { addFontsFromNode, tipTapConfig: { extensions: tipTapDefaultExtensions } },
			deepLinks: { param: 'd' },
		})
		try {
			const rendered = await renderEditor(textOptionsProps())
			const editor: Editor = onMount.mock.lastCall![0]
			vi.spyOn(editor, 'dispose')
			expect(editor.getTextOptions().addFontsFromNode).toBe(addFontsFromNode)
			expect(registerDeepLinkListener).toHaveBeenLastCalledWith({ param: 'd' })

			// re-render with fresh (but equal) deprecated props:
			const next = textOptionsProps()
			// These props are deprecated on purpose: this test checks that equal deprecated values do not
			// recreate the editor.
			// oxlint-disable-next-line typescript/no-deprecated
			rendered.props.textOptions = next.textOptions
			// oxlint-disable-next-line typescript/no-deprecated
			rendered.props.deepLinks = next.deepLinks
			await flush()
			expect(editor.dispose).not.toHaveBeenCalled()
		} finally {
			registerDeepLinkListener.mockRestore()
		}
	})

	it.each([
		['options.deepLinks', { options: { deepLinks: true as const } }],
		['the deprecated deepLinks prop', { deepLinks: true as const }],
	])('keeps deep links enabled and the editor when re-rendered with %s: true', async (_, props) => {
		const registerDeepLinkListener = vi.spyOn(Editor.prototype, 'registerDeepLinkListener')
		const onMount = vi.fn()
		try {
			const rendered = await renderEditor({ onMount, ...props })
			const editor: Editor = onMount.mock.lastCall![0]
			vi.spyOn(editor, 'dispose')
			expect(registerDeepLinkListener).toHaveBeenCalledTimes(1)
			expect(registerDeepLinkListener).toHaveBeenLastCalledWith({})

			// re-render with equal props:
			Object.assign(rendered.props, props)
			await flush()
			expect(editor.dispose).not.toHaveBeenCalled()
			expect(registerDeepLinkListener).toHaveBeenCalledTimes(1)
		} finally {
			registerDeepLinkListener.mockRestore()
		}
	})

	it('will populate the store from the snapshot prop', async () => {
		const snapshot = {
			schema: {
				schemaVersion: 2,
				sequences: {
					'com.tldraw.store': 4,
					'com.tldraw.asset': 1,
					'com.tldraw.camera': 1,
					'com.tldraw.document': 2,
					'com.tldraw.instance': 25,
					'com.tldraw.instance_page_state': 5,
					'com.tldraw.page': 1,
					'com.tldraw.instance_presence': 5,
					'com.tldraw.pointer': 1,
					'com.tldraw.shape': 4,
					'com.tldraw.asset.bookmark': 2,
					'com.tldraw.asset.image': 5,
					'com.tldraw.asset.video': 5,
					'com.tldraw.shape.arrow': 5,
					'com.tldraw.shape.bookmark': 2,
					'com.tldraw.shape.draw': 2,
					'com.tldraw.shape.embed': 4,
					'com.tldraw.shape.frame': 0,
					'com.tldraw.shape.geo': 9,
					'com.tldraw.shape.group': 0,
					'com.tldraw.shape.highlight': 1,
					'com.tldraw.shape.image': 4,
					'com.tldraw.shape.line': 5,
					'com.tldraw.shape.note': 7,
					'com.tldraw.shape.text': 2,
					'com.tldraw.shape.video': 2,
					'com.tldraw.binding.arrow': 0,
				},
			},
			store: {
				'document:document': {
					gridSize: 10,
					name: '',
					meta: {},
					id: 'document:document',
					typeName: 'document',
				},
				'page:page': { meta: {}, id: 'page:page', name: 'Page 1', index: 'a1', typeName: 'page' },
				'shape:SxHfVyCVdM4Ryl27eJNRD': {
					x: 608.718221918489,
					y: 298.97020222415506,
					rotation: 0,
					isLocked: false,
					opacity: 1,
					meta: {},
					id: 'shape:SxHfVyCVdM4Ryl27eJNRD',
					type: 'geo',
					props: {
						w: 152.74967383200806,
						h: 134.57489438369782,
						geo: 'rectangle',
						color: 'black',
						labelColor: 'black',
						fill: 'none',
						dash: 'draw',
						size: 'm',
						font: 'draw',
						text: '',
						align: 'middle',
						verticalAlign: 'middle',
						growY: 0,
						url: '',
						scale: 1,
					},
					parentId: 'page:page',
					index: 'a1',
					typeName: 'shape',
				},
			},
		} as any

		const onMount = vi.fn()
		await renderEditor(
			{ onMount, shapeUtils: defaultShapeUtils, snapshot, options },
			{ waitForPatterns: true }
		)
		const editor: Editor = onMount.mock.lastCall![0]

		await act(() => editor.selectAll())

		expect(editor.getSelectedShapes()).toMatchObject([
			{
				id: 'shape:SxHfVyCVdM4Ryl27eJNRD',
				type: 'geo',
				props: { w: 152.74967383200806, h: 134.57489438369782 },
			},
		])
	})

	it('passes through the `assets` prop when creating its own in-memory store', async () => {
		const myUploadFn = vi.fn()
		const assetStore: TLAssetStore = { upload: myUploadFn }
		const onMount = vi.fn()

		await renderEditor(
			{ onMount, shapeUtils: defaultShapeUtils, assets: assetStore },
			{ waitForPatterns: true }
		)
		const editor: Editor = onMount.mock.lastCall![0]

		expect(editor.store.props.assets.upload).toBe(myUploadFn)
	})

	it('passes through the `assets` prop when using `persistenceKey`', async () => {
		const myUploadFn = vi.fn()
		const assetStore: TLAssetStore = { upload: myUploadFn }
		const onMount = vi.fn()

		await renderEditor(
			{
				onMount,
				shapeUtils: defaultShapeUtils,
				assets: assetStore,
				persistenceKey: 'hello-world',
			},
			{ waitForPatterns: true }
		)
		const editor: Editor = onMount.mock.lastCall![0]

		expect(editor.store.props.assets.upload).toBe(myUploadFn)
	})

	it('will not re-create the editor if re-rendered with identical options', async () => {
		const onMount = vi.fn()

		const renderer = await renderEditor({ onMount, options: { maxPages: 1 } })

		expect(onMount).toHaveBeenCalledTimes(1)
		const editor: Editor = onMount.mock.lastCall![0]
		vi.spyOn(editor, 'dispose')

		renderer.props.options = { maxPages: 1 }
		await flush()
		expect(editor.dispose).not.toHaveBeenCalled()
	})
})

const CARD_TYPE = 'card'

declare module '@svelte-draw/tlschema' {
	export interface TLGlobalShapePropsMap {
		[CARD_TYPE]: { w: number; h: number }
	}
}

type CardShape = TLShape<typeof CARD_TYPE>

describe('Custom shapes', () => {
	class CardUtil extends BaseBoxShapeUtil<CardShape> {
		static override type = CARD_TYPE

		override isAspectRatioLocked(shape: CardShape) {
			return false
		}
		override canResize(shape: CardShape) {
			return true
		}

		override getDefaultProps(): CardShape['props'] {
			return {
				w: 300,
				h: 300,
			}
		}

		component(shape: CardShape) {
			return shapeView(CardShapeView, { id: shape.id, w: shape.props.w, h: shape.props.h })
		}

		getIndicatorPath(shape: CardShape) {
			const path = new Path2D()
			path.rect(0, 0, shape.props.w, shape.props.h)
			return path
		}
	}

	class CardTool extends BaseBoxShapeTool {
		static override id = 'card'
		static override initial = 'idle'
		override shapeType = 'card' as const
	}

	const tools = [CardTool]
	const shapeUtils = [CardUtil]

	it('Uses custom shapes', async () => {
		let editor = {} as Editor
		const rendered = await renderEditor({
			shapeUtils,
			tools: [...defaultTools, ...tools],
			initialState: 'select',
			onMount: (editorApp) => {
				editor = editorApp
			},
		})

		expect(editor).toBeTruthy()
		await act(() => {
			editor.updateInstanceState({ screenBounds: { x: 0, y: 0, w: 1080, h: 720 } })
		})

		expect(editor.shapeUtils.card).toBeTruthy()
		checkAllShapes(editor, ['group', 'card'])

		const id = createShapeId()

		await act(() => {
			editor.createShapes([
				{
					id,
					type: 'card',
					props: { w: 100, h: 100 },
				},
			])
		})

		// Does the shape exist?
		expect(editor.getShape(id)).toMatchObject({
			id,
			type: 'card',
			x: 0,
			y: 0,
			opacity: 1,
			props: { w: 100, h: 100 },
		})

		// Is the shape's component rendering?
		expect(await findAllByTestId(rendered.target, 'card-shape')).not.toHaveLength(0)

		// Select the shape
		await act(() => editor.select(id))

		// Indicators are now rendered via the canvas overlay system (not DOM),
		// so we verify selection state instead of a DOM element
		expect(editor.getSelectedShapeIds()).toEqual([id])

		// Select the tool...
		await act(() => editor.setCurrentTool('card'))

		// Is the editor's current tool correct?
		expect(editor.getCurrentToolId()).toBe('card')
	})
})

describe('<SvelteDrawEditor /> i18n', () => {
	const rectangle = { id: 'tool.rectangle', defaultMessage: 'Rectangle' }
	const adapterSaying = (word: string) => () => ({
		locale: 'en',
		dir: 'ltr' as const,
		translate: () => word,
	})

	// An adapter written inline is a new function on every render. It used to sit among the deps
	// that recreate the editor, so each render threw away camera, selection and undo history.
	it('keeps the same editor when the adapter changes identity', async () => {
		let mounts = 0
		let editor: Editor | undefined
		const onMount = (e: Editor) => {
			mounts++
			editor = e
		}
		const rendered = await renderEditor({
			tools: defaultTools,
			initialState: 'select',
			onMount,
			i18n: adapterSaying('first'),
		})
		rendered.props.i18n = adapterSaying('second')
		await flush()

		expect(mounts).toBe(1)
		// …and it still reads whichever adapter is current.
		expect(editor!.i18n().translate(rectangle)).toBe('second')
	})

	// The `i18n` prop is new, so an app composing <SvelteDrawEditor> and <SvelteDrawUi> by hand doesn't pass
	// one — and shape names now resolve through the editor's i18n, so they fell back to English.
	it('falls back to the UI translations when the host passes none', async () => {
		let resolve!: (e: Editor) => void
		const mountedEditor = new Promise<Editor>((r) => (resolve = r))
		await renderComponent(
			EditorWithUi,
			{
				editorProps: { shapeUtils: defaultShapeUtils, tools: defaultTools, onMount: resolve },
				uiProps: { overrides: { translations: { en: { 'tool.rectangle': 'Rechteck' } } } },
			},
			{ waitForCanvas: false }
		)
		const editor = await mountedEditor
		await flush()
		expect(editor.i18n().translate(rectangle)).toBe('Rechteck')
	})

	it('prefers an i18n prop over the UI translations', async () => {
		let resolve!: (e: Editor) => void
		const mountedEditor = new Promise<Editor>((r) => (resolve = r))
		await renderComponent(
			EditorWithUi,
			{
				editorProps: {
					shapeUtils: defaultShapeUtils,
					tools: defaultTools,
					onMount: resolve,
					i18n: adapterSaying('from the prop'),
				},
				uiProps: { overrides: { translations: { en: { 'tool.rectangle': 'Rechteck' } } } },
			},
			{ waitForCanvas: false }
		)
		const editor = await mountedEditor
		await flush()
		expect(editor.i18n().translate(rectangle)).toBe('from the prop')
	})
})
