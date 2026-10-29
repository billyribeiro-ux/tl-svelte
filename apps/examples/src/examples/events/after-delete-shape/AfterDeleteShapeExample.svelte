<script lang="ts">
	import { SvelteDraw, createShapeId, toRichText, type Editor } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	function createDemoShapes(editor: Editor) {
		const frameId = createShapeId()
		editor.createShapes([
			{
				id: frameId,
				type: 'frame',
				props: { w: 400, h: 200 },
			},
			{
				id: createShapeId(),
				type: 'text',
				parentId: frameId,
				x: 50,
				y: 40,
				props: {
					richText: toRichText('Frames will be deleted when their last child is.'),
					w: 300,
					autoSize: false,
				},
			},
			...[50, 180, 310].map((x) => ({
				id: createShapeId(),
				type: 'geo' as const,
				parentId: frameId,
				x,
				y: 120,
				props: { w: 40, h: 40 },
			})),
		])

		editor.zoomToFit({ animation: { duration: 0 } })
	}

	function handleMount(editor: Editor) {
		editor.sideEffects.registerAfterDeleteHandler('shape', (shape) => {
			const parentShape = editor.getShape(shape.parentId)
			if (parentShape && parentShape.type === 'frame') {
				const siblings = editor.getSortedChildIdsForParent(parentShape.id)
				if (siblings.length === 0) {
					editor.deleteShape(parentShape.id)
				}
			}
		})

		createDemoShapes(editor)
	}
</script>

<div class="svelte-draw__editor">
	<SvelteDraw onMount={handleMount} />
</div>
