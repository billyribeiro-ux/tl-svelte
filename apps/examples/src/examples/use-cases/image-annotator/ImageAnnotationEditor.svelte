<script lang="ts">
	import {
		AssetRecordType,
		SvelteDraw,
		createShapeId,
		type Editor,
		type TLComponents,
	} from 'svelte-draw'
	import { setAnnotator } from './annotatorContext'
	import DoneButton from './DoneButton.svelte'
	import ImageBoundsOverlay from './ImageBoundsOverlay.svelte'
	import type { AnnotatorImage } from './types'

	let { image, onDone }: { image: AnnotatorImage; onDone(result: Blob): void } = $props()

	// [1]
	const imageShapeId = createShapeId()

	setAnnotator({
		imageShapeId,
		onDone: (result) => onDone(result),
	})

	const components: TLComponents = {
		PageMenu: null,
		InFrontOfTheCanvas: ImageBoundsOverlay,
		SharePanel: DoneButton,
	}

	function onMount(editor: Editor) {
		const assetId = AssetRecordType.createId()
		editor.createAssets([
			{
				id: assetId,
				typeName: 'asset',
				type: 'image',
				meta: {},
				props: {
					w: image.width,
					h: image.height,
					mimeType: image.type,
					src: image.src,
					name: 'image',
					isAnimated: false,
				},
			},
		])
		editor.createShape({
			id: imageShapeId,
			type: 'image',
			x: 0,
			y: 0,
			isLocked: true,
			props: {
				w: image.width,
				h: image.height,
				assetId,
			},
		})

		// [2]
		function makeSureShapeIsAtBottom() {
			const shape = editor.getShape(imageShapeId)
			if (!shape) return

			const pageId = editor.getCurrentPageId()
			if (shape.parentId !== pageId) {
				editor.moveShapesToPage([shape], pageId)
			}

			const siblings = editor.getSortedChildIdsForParent(pageId)
			if (siblings[0] !== imageShapeId) {
				editor.sendToBack([shape])
			}
		}

		makeSureShapeIsAtBottom()

		const removeOnCreate = editor.sideEffects.registerAfterCreateHandler(
			'shape',
			makeSureShapeIsAtBottom
		)
		const removeOnChange = editor.sideEffects.registerAfterChangeHandler(
			'shape',
			makeSureShapeIsAtBottom
		)

		// [3]
		const removeKeepLocked = editor.sideEffects.registerBeforeChangeHandler(
			'shape',
			(prev, next) => {
				if (next.id !== imageShapeId) return next
				if (next.isLocked) return next
				return { ...prev, isLocked: true }
			}
		)

		// [4]
		editor.setCameraOptions({
			constraints: {
				initialZoom: 'default',
				baseZoom: 'fit-min-100',
				bounds: { w: image.width, h: image.height, x: 0, y: 0 },
				padding: { x: 32, y: 64 },
				origin: { x: 0.5, y: 0.5 },
				behavior: 'contain',
			},
		})
		editor.setCamera(editor.getCamera(), { reset: true })

		// The image setup shouldn't be undoable
		editor.clearHistory()

		return () => {
			removeOnCreate()
			removeOnChange()
			removeKeepLocked()
		}
	}
</script>

<SvelteDraw {onMount} {components} />

<!--
[1]
The image shape's id is decided up front so the overlay and done button can be given it
before the editor exists. The parent remounts this component (via `{#key}`) when a new image is
chosen, so the id is stable for the life of one annotation session.

[2]
Annotations must draw on top of the image, so after any shape is created or changed we make
sure the image is still the first child of the page (and still on the page at all).

[3]
A before-change side effect rejects any update that would unlock the image, so it can't be
moved, deleted, or edited.

[4]
Camera constraints keep the image in view: `contain` stops you panning away from it and
`fit-min-100` stops you zooming out past the point where it fills the viewport. Try a very
long, thin image to see the behavior.
-->
