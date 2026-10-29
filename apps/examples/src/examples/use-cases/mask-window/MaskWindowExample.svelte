<script lang="ts">
	import { createShapeId, SvelteDraw, type Editor, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import MaskWindow from './MaskWindow.svelte'
	import './mask-window.css'

	const components: TLComponents = {
		InFrontOfTheCanvas: MaskWindow,
	}

	// Seed an empty canvas with some shapes and select one so the mask has something to show
	function seedCanvas(editor: Editor) {
		if (editor.getCurrentPageShapeIds().size > 0) return

		const vpb = editor.getViewportPageBounds()
		for (let i = 0; i < 50; i++) {
			const x = vpb.x + Math.random() * vpb.w
			const y = vpb.y + Math.random() * vpb.h
			editor.createShape({ type: 'geo', x, y })
		}

		const id = createShapeId()
		editor.createShape({
			id,
			type: 'geo',
			x: vpb.center.x - 100,
			y: vpb.center.y - 100,
			props: { w: 200, h: 200 },
		})
		editor.select(id)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw persistenceKey="mask" {components} onMount={seedCanvas} />
</div>
