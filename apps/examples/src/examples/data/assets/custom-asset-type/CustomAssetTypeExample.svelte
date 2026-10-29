<script lang="ts">
	import { SvelteDraw, createShapeId, toRichText, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { FileAssetUtil } from './FileAssetUtil'
	import { FileCardShapeUtil } from './FileCardShapeUtil'

	// There's a guide at the bottom of this file!

	const assetUtils = [FileAssetUtil]
	const shapeUtils = [FileCardShapeUtil]

	const instructionText = `Drag a file with these supported extensions ${FileAssetUtil.supportedExtensions.join(', ')} onto the board`

	function onMount(editor: Editor) {
		if (editor.getCurrentPageShapes().length === 0) {
			editor.createShapes([
				{
					id: createShapeId(),
					type: 'text',
					x: 100,
					y: 100,
					props: {
						richText: toRichText(instructionText),
					},
				},
			])
		}
	}
</script>

<!-- [9] -->
<div class="svelte-draw__editor">
	<SvelteDraw {assetUtils} {shapeUtils} persistenceKey="custom-asset-type-example" {onMount} />
</div>

<!--
By default svelte-draw handles image, video, and bookmark assets. An `AssetUtil` teaches the
editor about a new asset type, and a `ShapeUtil` with `handledAssetTypes` tells it what
shape to create when one of those assets lands on the canvas.

[1]
The custom asset type (FileAssetUtil.ts). Augmenting `TLGlobalAssetPropsMap` makes `TLAsset`
(and `editor.getAsset`) aware of it, the same way `TLGlobalShapePropsMap` works for shapes.

[2]
`FileAssetUtil` handles MIME-type matching and file-to-asset conversion for the new type.

[3]
Static `props` are the store validators for the asset's props, using the same `T`
validators as shape utils.

[4]
When a file is dropped or pasted, the editor asks each registered `AssetUtil` whether it
supports the file's MIME type. Only files that match reach `getAssetFromFile`.

[5]
`getAssetFromFile` builds the asset record from a dropped file. `src` is left `null`
because the asset store's `upload` fills in the URL after the file is stored.

[6]
`handledAssetTypes` (FileCardShapeUtil.ts) connects the shape to the asset type: when a
`file` asset is created, the editor finds this shape util and calls `createShapeForAsset`.

[7]
Return the shape partial to place on the canvas for a new asset. Returning `null` would
skip creating a shape.

[8]
Once the asset store has uploaded the file and set `src`, the filename becomes a link
(FileCardShape.svelte).

[9]
Register both utils. No custom external content handler is needed: the default file
handler picks the matching `AssetUtil` and uploads through the asset store. Here that is
the default store, which inlines files as data URLs; a real app would pass its own
`TLAssetStore` via the `assets` prop (see the "Hosted images" example).
-->
