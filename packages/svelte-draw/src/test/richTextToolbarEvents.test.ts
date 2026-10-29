import { Editor as TextEditor } from '@tiptap/core'
import { vi } from 'vitest'
import { tipTapDefaultExtensions } from '../lib/utils/text/richText'
import RichTextToolbarTopPanel, { richTextPanel } from './svelte/RichTextToolbarTopPanel.svelte'
import { act, renderSvelteDraw } from './testutils/renderSvelteDrawComponent'

// The real toolbar only mounts while editing a shape with a non-collapsed selection, which jsdom
// can't lay out, so the content is rendered directly against a standalone TipTap editor.
it('reports each rich text toolbar button as its own operation', async () => {
	const textEditor = new TextEditor({
		element: document.createElement('div'),
		extensions: tipTapDefaultExtensions,
		enableCoreExtensions: { textDirection: false },
		content: 'hello',
	})
	const onUiEvent = vi.fn()

	richTextPanel.textEditor = textEditor
	const rendered = await renderSvelteDraw({
		onUiEvent,
		components: { TopPanel: RichTextToolbarTopPanel },
	})

	const operations = ['bold', 'italic', 'code', 'bulletList', 'highlight']
	for (const operation of operations) {
		const button = document.querySelector(`[data-testid="rich-text.${operation}"]`) as HTMLElement
		await act(async () => button.click())
	}

	const reported = onUiEvent.mock.calls
		.filter(([name]) => name === 'rich-text')
		.map(([, data]) => data.operation)
	expect(reported).toEqual(operations)

	// Unmount first: the toolbar content unsubscribes from the TipTap editor on teardown.
	rendered.editor.dispose()
	rendered.unmount()
	textEditor.destroy()
	richTextPanel.textEditor = null
})
