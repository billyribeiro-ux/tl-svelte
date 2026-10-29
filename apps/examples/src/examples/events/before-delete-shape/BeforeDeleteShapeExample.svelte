<script lang="ts">
	import { SvelteDraw, createShapeId, toRichText, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	function createDemoShapes(editor: Editor) {
		editor
			.createShapes([
				{
					id: createShapeId(),
					type: 'text',
					props: {
						richText: toRichText("Red shapes can't be deleted"),
						color: 'red',
					},
				},
				{
					id: createShapeId(),
					type: 'text',
					y: 30,
					props: {
						richText: toRichText('but other shapes can'),
						color: 'black',
					},
				},
			])
			.zoomToFit({ animation: { duration: 0 } })
	}

	function handleMount(editor: Editor) {
		editor.sideEffects.registerBeforeDeleteHandler('shape', (shape) => {
			if ('color' in shape.props && shape.props.color === 'red') {
				return false
			}
			return
		})

		createDemoShapes(editor)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={handleMount} />
</div>
