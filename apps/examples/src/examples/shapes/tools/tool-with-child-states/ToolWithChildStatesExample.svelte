<script lang="ts">
	import { type Editor, SvelteDraw, toRichText } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { StickerTool } from './StickerTool'

	// There's a guide at the bottom of StickerTool.ts!

	// [5]
	const customTools = [StickerTool]

	function onMount(editor: Editor) {
		editor.createShape({
			type: 'text',
			x: 50,
			y: 50,
			props: {
				richText: toRichText(
					'-Double click the canvas to add a sticker\n-Double click a sticker to delete it\n-Click and drag on a sticker to change it\n-Click and drag on the canvas to create a sticker\n-Shift click a sticker for a surprise!'
				),
				size: 's',
				textAlign: 'start',
			},
		})
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw tools={customTools} initialState="sticker" hideUi {onMount} />
</div>
