<script lang="ts">
	import { SvelteDraw, type TLComponents, tipTapDefaultExtensions } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './RichTextCustomExtension.css'
	import { Wavy } from './Wavy'
	import WavyToolbar from './WavyToolbar.svelte'

	// There's a guide at the bottom of this file!

	// [2]
	const components: TLComponents = {
		RichTextToolbar: WavyToolbar,
	}

	// [5]
	const options = {
		text: {
			tipTapConfig: {
				extensions: [...tipTapDefaultExtensions, Wavy],
			},
		},
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="rich-text-custom-extension" {components} {options} />
</div>

<!--
/*
[1]
(Wavy.ts) A TipTap mark extension. It renders as a `<span class="wavy">` (styled in
RichTextCustomExtension.css) and adds `setWavy` / `toggleWavy` / `unsetWavy` commands. The
`declare module '@tiptap/core'` block above tells TypeScript about those commands so
`textEditor.chain().toggleWavy()` type checks.

[2]
(WavyToolbar.svelte) Replace the rich text toolbar with our own. `DefaultRichTextToolbar` handles positioning the
toolbar over the text selection; we render our custom button plus the default bold/italic/etc
buttons via `DefaultRichTextToolbarContent`. `editor.getRichTextEditor()` is the TipTap editor
for the text currently being edited, or null when no text is being edited.

[3]
The TipTap editor isn't a svelte-draw signal, so `isActive` wouldn't otherwise refresh as the
selection moves in and out of marked text. Re-run on every TipTap transaction (a counter bumped from a `transaction` listener) so the
button's active state stays in sync.

[4]
Preventing the default on pointer down keeps the toolbar button from taking focus away from
the text editor, which would collapse the selection before the command runs.

[5]
Pass the extension list through `options.text.tipTapConfig`. Spread `tipTapDefaultExtensions`
so svelte-draw's own configuration (StarterKit settings, highlight, keyboard tweaks) stays in place;
passing a bare `StarterKit` instead would drop those.
*/
-->
