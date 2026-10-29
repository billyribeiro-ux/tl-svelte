<script lang="ts">
	import { createShapeId, SvelteDraw, type Editor, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import { SOFT_CLIP_META_KEY } from './softClip'
	import SoftClipUI from './SoftClipUI.svelte'
	import './soft-clip.css'

	function setupDemoShapes(editor: Editor) {
		if (editor.getCurrentPageShapeIds().size > 0) return

		const { center } = editor.getViewportPageBounds()

		editor.createShapes([
			{
				type: 'geo',
				x: center.x - 280,
				y: center.y - 200,
				props: { geo: 'rectangle', w: 160, h: 110, color: 'blue', fill: 'semi' },
			},
			{
				type: 'geo',
				x: center.x + 80,
				y: center.y - 220,
				props: { geo: 'ellipse', w: 130, h: 130, color: 'yellow', fill: 'semi' },
			},
			{
				type: 'geo',
				x: center.x - 240,
				y: center.y + 30,
				props: { geo: 'triangle', w: 150, h: 140, color: 'green', fill: 'semi' },
			},
			{
				type: 'geo',
				x: center.x + 60,
				y: center.y + 40,
				props: { geo: 'star', w: 150, h: 140, color: 'violet', fill: 'semi' },
			},
		])

		// [3]
		const clipId = createShapeId()
		editor.createShape({
			id: clipId,
			type: 'geo',
			x: center.x - 180,
			y: center.y - 180,
			props: { geo: 'ellipse', w: 360, h: 360, color: 'black', fill: 'none' },
			meta: { [SOFT_CLIP_META_KEY]: true },
		})
		editor.select(clipId)
	}

	const components: TLComponents = {
		InFrontOfTheCanvas: SoftClipUI,
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="soft-clip" {components} onMount={setupDemoShapes} />
</div>

<!--
[3]
Soft clipping is opted into per shape via `shape.meta.softClip`. Meta is free-form data
stored on the record, so no custom shape util or schema change is needed and it persists
with the document.
-->
