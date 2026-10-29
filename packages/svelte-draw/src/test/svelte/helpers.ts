import {
	Editor,
	createTLStore,
	type SvgExportContext,
	type TLTextOptions,
	type TLAnyBindingUtilConstructor,
	type TLAnyShapeUtilConstructor,
	type TLStateNodeConstructor,
} from '@svelte-draw/editor'
import { flushSync, mount, unmount, type Component } from 'svelte'
import ComponentHost from './ComponentHost.svelte'
import './setup'

/** Flushes Svelte effects and pending microtasks/timers: the equivalent of React's `act(async)`. */
export async function flush(ms = 0) {
	flushSync()
	// eslint-disable-next-line no-restricted-globals
	await new Promise((resolve) => setTimeout(resolve, ms))
	flushSync()
}

/** A real Editor attached to a `.tl-container` in the document, for component tests. */
export function createTestEditor(
	opts: {
		shapeUtils?: readonly TLAnyShapeUtilConstructor[]
		bindingUtils?: readonly TLAnyBindingUtilConstructor[]
		tools?: readonly TLStateNodeConstructor[]
		initialState?: string
		textOptions?: TLTextOptions
	} = {}
) {
	const container = document.createElement('div')
	container.className = 'tl-container tl-theme__light'
	document.body.appendChild(container)
	const shapeUtils = opts.shapeUtils ?? []
	const bindingUtils = opts.bindingUtils ?? []
	const editor = new Editor({
		store: createTLStore({ shapeUtils: [...shapeUtils], bindingUtils: [...bindingUtils] }),
		shapeUtils,
		bindingUtils,
		tools: opts.tools ?? [],
		initialState: opts.initialState,
		textOptions: opts.textOptions,
		getContainer: () => container,
	})
	editor.updateViewportScreenBounds(container)
	return {
		editor,
		container,
		dispose() {
			editor.dispose()
			container.remove()
		},
	}
}

/** Mounts `component` inside the editor context and returns a handle to unmount it. */
export function mountInEditor(
	test: { editor: Editor; container: HTMLElement },
	component: Component<any>,
	props: object = {},
	svgExport?: SvgExportContext,
	idScope = true
) {
	const target = document.createElement('div')
	test.container.appendChild(target)
	const mounted = mount(ComponentHost, {
		target,
		props: { editor: test.editor, container: test.container, component, props, svgExport, idScope },
	})
	flushSync()
	return {
		target,
		unmount() {
			unmount(mounted)
			target.remove()
		},
	}
}
