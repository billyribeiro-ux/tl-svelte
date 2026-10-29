<script lang="ts">
	import { SvelteDraw, type TLComponents, tipTapDefaultExtensions } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './OutlinedTextExample.css'
	import { Outline } from './Outline'
	import OutlinedTextToolbar from './OutlinedTextToolbar.svelte'

	// There's a guide at the bottom of this file!

	// [2]
	const components: TLComponents = {
		RichTextToolbar: OutlinedTextToolbar,
	}

	// [4]
	const options = {
		text: {
			tipTapConfig: {
				extensions: [...tipTapDefaultExtensions, Outline],
			},
		},
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="outlined-text-example" {components} {options} />
</div>

<!--
/*
[1]
(Outline.ts) A TipTap mark extension. It renders as `<span class="outlined filled">`, and the outline effect
itself is plain CSS (`-webkit-text-stroke`) in OutlinedTextExample.css. The `declare module`
block above registers the mark's commands with TypeScript.

[2]
(OutlinedTextToolbar.svelte) Override the `RichTextToolbar` component. `DefaultRichTextToolbar` positions the toolbar over
the selection; inside it we add our toggle button and keep the default buttons via
`DefaultRichTextToolbarContent`. `editor.getRichTextEditor()` is the TipTap editor for the
text being edited, or null when nothing is being edited.

[3]
The transaction re-render and the pointer-down `preventDefault` are the same as in the
rich text custom extension example; see its footnotes [3] and [4] for why.

[4]
Pass extensions through `options.text.tipTapConfig`. Spread `tipTapDefaultExtensions` so
svelte-draw's own StarterKit configuration and extras stay in place.
*/
-->
