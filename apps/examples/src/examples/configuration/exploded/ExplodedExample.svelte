<script lang="ts">
	import {
		SvelteDrawEditor,
		SvelteDrawUi,
		defaultAddFontsFromNode,
		defaultAssetUtils,
		defaultBindingUtils,
		defaultEditorAssetUrls,
		defaultOverlayUtils,
		defaultShapeTools,
		defaultShapeUtils,
		defaultTools,
		tipTapDefaultExtensions,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import InsideEditorAndUiContext from './InsideEditorAndUiContext.svelte'

	// There's a guide at the bottom of this file!

	const allDefaultTools = [...defaultTools, ...defaultShapeTools]
	const defaultOptions = {
		text: {
			tipTapConfig: {
				extensions: tipTapDefaultExtensions,
			},
			addFontsFromNode: defaultAddFontsFromNode,
		},
	}
</script>

<!-- [1] -->
<div class="svelte-draw__editor">
	<SvelteDrawEditor
		initialState="select"
		shapeUtils={defaultShapeUtils}
		bindingUtils={defaultBindingUtils}
		assetUtils={defaultAssetUtils}
		overlayUtils={defaultOverlayUtils}
		tools={allDefaultTools}
		persistenceKey="exploded-example"
		options={defaultOptions}
		assetUrls={defaultEditorAssetUrls}
	>
		<SvelteDrawUi>
			<InsideEditorAndUiContext />
		</SvelteDrawUi>
	</SvelteDrawEditor>
</div>

<!--
The `SvelteDraw` component is a thin wrapper that wires these pieces together. Assembling them
yourself lets you swap or omit any of them.

[1]
`SvelteDrawEditor` is the UI-free editor. Everything the `SvelteDraw` component normally supplies is
passed in explicitly here: the default shape utils, binding utils, asset utils, overlay utils,
tools, asset URLs, and the rich text options. Swap any of these for your own; the custom config example shows
how to write shapes and tools. `SvelteDrawUi` renders the default UI around it, and the context menu
is mounted as a child so it can wrap the canvas.

[2]
Two more things the `SvelteDraw` component does on mount that `SvelteDrawEditor` does not: register the
default external content handlers (dropped and pasted files, URLs, embeds, SVG text) and the
default store side effects (for example, resolving an embed's aspect ratio when it is created).
Both need the toasts and translation contexts from `SvelteDrawUi`, which is why this component is
rendered inside it.
-->
