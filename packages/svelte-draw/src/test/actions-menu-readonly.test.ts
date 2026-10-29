import { Editor } from '@svelte-draw/editor'
import {
	act,
	byTestId,
	renderSvelteDraw,
	type RenderedSvelteDraw,
} from './testutils/renderSvelteDrawComponent'

let editor: Editor
let rendered: RenderedSvelteDraw

beforeEach(async () => {
	// Pin the quick actions into the menu panel so the test does not depend on jsdom's viewport width
	rendered = await renderSvelteDraw(
		{ options: { actionShortcutsLocation: 'menu' } },
		{ waitForPatterns: true }
	)
	editor = rendered.editor
})

afterEach(() => {
	editor?.dispose()
	rendered?.unmount()
})

describe('actions menu in readonly mode', () => {
	it('shows the actions menu button when not readonly', async () => {
		expect(await rendered.findByTestId('actions-menu.button')).toBeTruthy()
	})

	it.each(['select', 'hand', 'zoom', 'eraser'])(
		'hides the actions menu button in readonly mode with the %s tool',
		async (toolId) => {
			await act(() => {
				editor.updateInstanceState({ isReadonly: true })
				editor.setCurrentTool(toolId)
			})
			expect(editor.getCurrentToolId()).toBe(toolId)
			expect(byTestId('actions-menu.button')).toBeNull()
		}
	)
})
