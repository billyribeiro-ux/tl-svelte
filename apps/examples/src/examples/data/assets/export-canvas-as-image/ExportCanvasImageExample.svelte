<script lang="ts" module>
	import { SvelteDraw, type TLUiComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import ExportCanvasButton from './ExportCanvasButton.svelte'

	const components: TLUiComponents = {
		SharePanel: ExportCanvasButton,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} />
</div>

<!--
[1]
`editor.toImage` renders the given shapes to a `Blob`. Passing every shape id on the
page exports the whole canvas; pass a subset (e.g. `editor.getSelectedShapeIds()`) to
export part of it. `format` can be 'png', 'jpeg', 'webp', or 'svg'.

[2]
The simplest way to download a blob in the browser is a temporary link with a
`download` attribute. Revoke the object URL afterwards to free the memory.

See the "Export canvas as image (with settings)" example for the other export options,
and the "Create an image shape" / "Hosted images" examples for handling assets.
-->
