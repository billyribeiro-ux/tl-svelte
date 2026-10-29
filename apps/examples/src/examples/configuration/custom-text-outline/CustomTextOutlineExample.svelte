<script lang="ts">
	// There's a guide at the bottom of this file!
	import {
		ArrowShapeUtil,
		GeoShapeUtil,
		SvelteDraw,
		TextShapeUtil,
		toRichText,
		type Editor,
	} from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	// [1]
	const shapeUtils = [
		ArrowShapeUtil.configure({ showTextOutline: false }),
		TextShapeUtil.configure({ showTextOutline: false }),
		GeoShapeUtil.configure({ showTextOutline: false }),
	]

	function handleMount(editor: Editor) {
		if (editor.getCurrentPageShapeIds().size > 0) return

		// [2]
		const message = toRichText('very good whiteboard')
		editor.createShapes([
			{ type: 'text', x: 100, y: 100, props: { richText: message } },
			{ type: 'text', x: 110, y: 110, props: { richText: message } },
			{ type: 'text', x: 120, y: 120, props: { richText: message } },
			{
				type: 'arrow',
				x: 0,
				y: 0,
				props: {
					richText: toRichText('hello world'),
					start: { x: 0, y: 0 },
					end: { x: 200, y: 200 },
				},
			},
		])
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw {shapeUtils} persistenceKey="custom-text-outline-example" onMount={handleMount} />
</div>

<!--
[1]
Text outlines are an option on each shape util that renders text labels, so each one has to
be configured separately. Passing the configured utils in `shapeUtils` replaces the defaults.

[2]
Overlapping text shapes and an arrow with a label. With outlines on, each label would get a
halo in the background color that separates it from the text behind it; here they run together.
-->
