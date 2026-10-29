<script lang="ts">
	import { SvelteDraw, type TLEditorComponents, type TLEditorSnapshot } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import ContextualToolbarComponent from './ContextualToolbarComponent.svelte'
	import _jsonSnapshot from './snapshot.json'

	// There's a guide at the bottom of this file!

	const jsonSnapshot = _jsonSnapshot as any as TLEditorSnapshot

	const components: TLEditorComponents = {
		InFrontOfTheCanvas: ContextualToolbarComponent,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {components} snapshot={jsonSnapshot} />
</div>

<!--
`SvelteDrawUiContextualToolbar` is rendered in the `InFrontOfTheCanvas` slot, so it sits on top of
the shapes but behind the rest of the UI.

[1] (ContextualToolbarComponent.svelte)
The component reads the selection, camera, and tool state through `fromComputed`, so it updates when
they change. We only show the toolbar while the select tool is idle, so it disappears while shapes are
being dragged, resized, or rotated.

[2]
Different shapes support different style properties. `getSharedStyles()` returns the styles
supported by every selected shape; if none of them support `DefaultSizeStyle` we don't show the
toolbar at all. If all the shapes have the same size, the entry's type is `shared` and we highlight
that size. If they differ, the type is `mixed` and nothing is highlighted.

[3]
`getSelectionBounds` tells the toolbar where to position itself. Here we use the selection's
rotated screen bounds with a height of zero so the toolbar sits along the top edge; you can use
any other logic you like.
-->
