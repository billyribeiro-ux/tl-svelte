import { Editor } from '@svelte-draw/editor'
import { mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import EditorHarness from './test/EditorHarness.svelte'
import { flush } from './test/helpers'

function dropEvent(dataTransfer: { files: File[]; getData(type: string): string }) {
	const event = new Event('drop', { bubbles: true, cancelable: true })
	Object.defineProperty(event, 'dataTransfer', { value: dataTransfer })
	return event
}

describe('useCanvasEvents drop handling', () => {
	let editor: Editor
	let canvas: HTMLElement
	let app: ReturnType<typeof mount>

	beforeEach(async () => {
		app = mount(EditorHarness, {
			target: document.body,
			props: {
				shapeUtils: [],
				bindingUtils: [],
				onMount: (e: Editor) => {
					editor = e
				},
			},
		})
		await flush()
		canvas = document.querySelector('[data-testid="canvas"]') as HTMLElement

		// Stand-ins for the default handlers: any undoable change will do.
		editor.registerExternalContentHandler('files', async () => {
			editor.createPage({ name: 'dropped' })
		})
		editor.registerExternalContentHandler('url', async () => {
			editor.createPage({ name: 'dropped' })
		})

		// An unmarked change before the drop, like a stroke the user just drew.
		editor.createPage({ name: 'before drop' })
	})

	afterEach(() => {
		unmount(app)
		document.body.innerHTML = ''
	})

	function pageNames() {
		return editor.getPages().map((p) => p.name)
	}

	it('makes a dropped file its own undo step', async () => {
		canvas.dispatchEvent(
			dropEvent({ files: [new File(['x'], 'x.png', { type: 'image/png' })], getData: () => '' })
		)
		await flush()
		expect(pageNames()).toEqual(['Page 1', 'before drop', 'dropped'])

		editor.undo()

		expect(pageNames()).toEqual(['Page 1', 'before drop'])
	})

	it('makes a dropped url its own undo step', async () => {
		canvas.dispatchEvent(
			dropEvent({ files: [], getData: (type) => (type === 'url' ? 'https://example.com' : '') })
		)
		await flush()
		expect(pageNames()).toEqual(['Page 1', 'before drop', 'dropped'])

		editor.undo()

		expect(pageNames()).toEqual(['Page 1', 'before drop'])
	})
})
