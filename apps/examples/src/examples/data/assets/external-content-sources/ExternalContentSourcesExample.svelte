<script lang="ts" module>
	import { defaultHandleExternalTextContent, type Editor, SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { DANGEROUS_HTML_TYPE, DangerousHtmlShapeUtil } from './DangerousHtmlShapeUtil'

	// There's a guide at the bottom of this page!

	const shapeUtils = [DangerousHtmlShapeUtil]

	function handleMount(editor: Editor) {
		// [3]
		editor.registerExternalContentHandler('text', async (content) => {
			// [4]
			const htmlSource = content.sources?.find((s) => s.type === 'text' && s.subtype === 'html')

			if (htmlSource) {
				const center = content.point ?? editor.getViewportPageBounds().center

				editor.createShape({
					type: DANGEROUS_HTML_TYPE,
					x: center.x - 250,
					y: center.y - 150,
					props: {
						html: htmlSource.data,
					},
				})
			} else {
				await defaultHandleExternalTextContent(editor, content)
			}
		})
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={handleMount} {shapeUtils} />
</div>

<!--
When content arrives from outside the editor (paste, drop, or `putExternalContent`), it's
classified as text, files, url, svg-text, embed, or svelte-draw content and routed to the handler
registered for that type. This example replaces the text handler so that pasted `text/html`
becomes a shape that renders the HTML directly.

[1]
The shape type (see DangerousHtmlShapeUtil.ts). Its `html` prop holds the raw pasted markup.

[2]
A minimal box shape that renders its `html` with `{@html ...}` (see DangerousHtmlShape.svelte).
It's called "dangerous" for a reason: never do this with HTML you don't trust. See the custom
shape examples for a fuller shape util.

[3]
`registerExternalContentHandler('text', ...)` replaces the built-in text handler for this
editor. The other content types (`files`, `url`, `svg-text`, `embed`, `svelte-draw`) can be
overridden the same way.

[4]
Pasted text arrives with a `sources` array, one entry per clipboard flavor. Rich text
editors and code editors usually put both `text/plain` and `text/html` on the clipboard.
When there's an HTML source we create our shape at the paste point (or the viewport center
for keyboard paste); otherwise we defer to `defaultHandleExternalTextContent`, which
creates a normal text shape.
-->
