<script lang="ts">
	import { AssetRecordType, SvelteDraw, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	const videoWidth = 640
	const videoHeight = 360

	// Video shapes work like image shapes: the shape references an asset record that holds
	// the source URL and natural size, so create the asset first. See the local-images example.
	function handleMount(editor: Editor) {
		const assetId = AssetRecordType.createId()
		editor.createAssets([
			{
				id: assetId,
				type: 'video',
				typeName: 'asset',
				props: {
					name: 'fluid.mp4',
					src: '/fluid.mp4',
					w: videoWidth,
					h: videoHeight,
					mimeType: 'video/mp4',
					isAnimated: true,
				},
				meta: {},
			},
		])

		const { x, y } = editor.getViewportPageBounds().center
		editor.createShape({
			type: 'video',
			x: x - videoWidth / 2,
			y: y - videoHeight / 2,
			props: {
				assetId,
				w: videoWidth,
				h: videoHeight,
			},
		})
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={handleMount} />
</div>
