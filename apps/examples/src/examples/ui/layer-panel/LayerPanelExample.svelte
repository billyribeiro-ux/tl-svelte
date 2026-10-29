<script lang="ts">
	import { SvelteDraw, type TLComponents, type TLEditorSnapshot } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import LayerPanel from './LayerPanel.svelte'
	import './layer-panel.css'
	import snapshot from './snapshot.json'

	// There's a guide at the bottom of this file!

	const components: TLComponents = {
		InFrontOfTheCanvas: LayerPanel,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw
		persistenceKey="layer-panel-example"
		{components}
		getShapeVisibility={(s) => (s.meta.force_show ? 'visible' : s.meta.hidden ? 'hidden' : 'inherit')}
		snapshot={snapshot as unknown as TLEditorSnapshot}
	/>
</div>

<!--
[1]
The panel (LayerPanel.svelte) is an `InFrontOfTheCanvas` component. It reads the current page's
top-level shape ids with `getSortedChildIdsForParent(pageId)` inside `fromComputed`, so it updates
when shapes are added, removed, or reordered.

[2]
`ShapeList` (see ShapeList.svelte) recurses into groups and frames using the same
`getSortedChildIdsForParent` call with a shape id as the parent.

[3]
`getShapeVisibility` (a prop of `<SvelteDraw>`) decides whether a shape is hidden. The panel stores
its choice in `shape.meta`: `hidden` hides a shape (and, via 'inherit', its children); `force_show`
lets a child stay visible even when its parent is hidden.
-->
