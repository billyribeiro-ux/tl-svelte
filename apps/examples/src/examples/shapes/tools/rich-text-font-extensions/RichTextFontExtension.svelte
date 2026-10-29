<script lang="ts">
	import { FontFamily } from '@tiptap/extension-font-family'
	import { TextStyleKit } from '@tiptap/extension-text-style'
	import {
		type Editor,
		SvelteDraw,
		type TLComponents,
		type TLTextOptions,
		defaultAddFontsFromNode,
		tipTapDefaultExtensions,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { FontSize } from './FontSizeExtension'
	import FontToolbar from './FontToolbar.svelte'
	import { extensionFontFamilies } from './fonts'
	import './RichTextFontExtension.css'

	// There's a guide at the bottom of this file!

	// [1]
	const components: TLComponents = {
		RichTextToolbar: FontToolbar,
	}

	// [4]
	const textOptions: Partial<TLTextOptions> = {
		tipTapConfig: {
			extensions: [...tipTapDefaultExtensions, FontFamily, FontSize, TextStyleKit],
		},
		// [5]
		addFontsFromNode(node, state, addFont) {
			state = defaultAddFontsFromNode(node, state, addFont)

			for (const mark of node.marks) {
				if (
					mark.type.name === 'textStyle' &&
					mark.attrs.fontFamily &&
					mark.attrs.fontFamily !== 'DEFAULT' &&
					mark.attrs.fontFamily !== state.family
				) {
					state = { ...state, family: mark.attrs.fontFamily }
				}
			}

			const font = extensionFontFamilies[state.family]?.[state.style]?.[state.weight]
			if (font) addFont(font)

			return state
		},
	}

	const options = { text: textOptions }

	// [6]
	const fontFaces = Object.values(extensionFontFamilies)
		.flatMap((fontFamily) => Object.values(fontFamily))
		.flatMap((fontStyle) => Object.values(fontStyle))

	function onMount(editor: Editor) {
		editor.fonts.requestFonts(fontFaces)
	}

	// [7]
	const assetUrls = {
		fonts: {
			svelteDraw_mono: extensionFontFamilies["'Exo 2'"].normal.normal.src.url,
		},
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="rich-text-font-extension"
		{components}
		{options}
		{assetUrls}
		{onMount}
	/>
</div>

<!--
/*
[1]
(FontToolbar.svelte) Replace the rich text toolbar. `DefaultRichTextToolbar` positions the toolbar over the text
selection; inside it we add two `<select>`s and keep the default buttons with
`DefaultRichTextToolbarContent`. `editor.getRichTextEditor()` is the TipTap editor for the text
being edited, or null when nothing is being edited.

[2]
The TipTap editor isn't a svelte-draw signal, so the selects wouldn't otherwise update as the caret
moves between differently styled text. Re-run on every TipTap transaction (a counter bumped from a `transaction` listener) so
`getAttributes('textStyle')` reflects the current selection.

[3]
Marking the pointer down as handled keeps the canvas from treating a click on the select as a
click on the shape behind it, which would end text editing.

[4]
The font extensions are TipTap's stock `FontFamily` and `TextStyleKit` plus a small `FontSize`
extension (see FontSizeExtension.ts). Spread `tipTapDefaultExtensions` first so svelte-draw's own
StarterKit configuration and extras stay in place.

[5]
`addFontsFromNode` is how svelte-draw finds out which fonts a piece of rich text uses, so it can
load them before rendering and embed them in SVG exports. The default handles svelte-draw's own
fonts; we extend it to walk the `textStyle` mark for a `fontFamily` attribute and, when it
matches one of our font families, add the matching `TLFontFace` to the document.

[6]
Preload every custom font on mount so switching families in the toolbar doesn't flash
unstyled text while the font downloads.

[7]
`assetUrls.fonts` overrides svelte-draw's built-in fonts. Here we point the mono font at Exo 2 to
show that the same font files can also replace a default font.
*/
-->
