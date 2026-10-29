<script lang="ts">
	import { defaultHandleExternalTextContent, getEditor, getToasts } from 'svelte-draw'
	import { simpleMermaidStringTest, stripMarkdownMermaidFence } from './mermaidDetection'

	const editor = getEditor()
	const { addToast } = getToasts()

	$effect(() => {
		// [1]
		editor.registerExternalContentHandler('text', async (content) => {
			// [2]
			const plainTextSource = content.sources?.find(
				(s) => s.type === 'text' && s.subtype === 'text'
			)
			const plainText = plainTextSource?.data ?? content.text
			const textToTest = simpleMermaidStringTest(plainText) ? plainText : content.text
	
			if (!simpleMermaidStringTest(textToTest)) {
				await defaultHandleExternalTextContent(editor, content)
				return
			}
			const mermaidText = stripMarkdownMermaidFence(textToTest)
			const { createMermaidDiagram } = await import('@svelte-draw/mermaid')
			const shapesBefore = new Set(editor.getCurrentPageShapeIds())
	
			const selectNewShapes = () => {
				const newShapeIds = [...editor.getCurrentPageShapeIds()].filter(
					(id) => !shapesBefore.has(id)
				)
				if (newShapeIds.length) {
					editor.setSelectedShapes(newShapeIds)
				}
			}
	
			try {
				// [3]
				const onUnsupportedDiagram = async (svgString: string) => {
					await editor.putExternalContent({
						type: 'svg-text',
						text: svgString,
						point: content.point,
						sources: content.sources,
					})
					addToast({
						id: 'unsupported-mermaid-diagram',
						title: 'Unsupported mermaid diagram',
						description: 'This diagram is not supported yet',
						severity: 'warning',
					})
				}
	
				await createMermaidDiagram(editor, mermaidText, { onUnsupportedDiagram })
				selectNewShapes()
			} catch (e) {
				console.error(e)
				await defaultHandleExternalTextContent(editor, content)
			}
		})
	})
</script>

<!--
[1]
`registerExternalContentHandler('text', ...)` replaces the default handler for pasted text.
Anything that doesn't look like Mermaid is passed on to `defaultHandleExternalTextContent`
so ordinary text still pastes as a text shape.

[2]
When HTML is pasted, the derived `content.text` has its line breaks stripped, which makes
Mermaid unparseable. The clipboard usually carries a plain-text source alongside the HTML,
so we prefer that when it looks like a diagram.

[3]
`createMermaidDiagram` creates native shapes for flowcharts, state diagrams, sequence
diagrams, and mind maps. For other diagram types it calls `onUnsupportedDiagram` with
Mermaid's SVG, which we drop onto the canvas as an image via `putExternalContent`.
-->
