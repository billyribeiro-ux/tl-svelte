<script lang="ts">
	import {
		createShapeId,
		getEditor,
		getToasts,
		getTranslation,
		notifyIfFileNotAllowed,
	} from 'svelte-draw'

	let { uploadedFile }: { uploadedFile?: File } = $props()

	const toasts = getToasts()
	const msg = getTranslation()
	const editor = getEditor()

	$effect(() => {
		const file = uploadedFile
		if (!file) return

		// this effect can run multiple times, but we only want the file to be uploaded once:
		if ((file as any).didUpload) return
		;(file as any).didUpload = true
		;(async () => {
			// we check if the file is allowed to be uploaded:
			if (!notifyIfFileNotAllowed(editor, file, { toasts, msg })) return

			// we get the asset for the uploaded file:
			const asset = await editor.getAssetForExternalContent({
				type: 'file',
				file,
			})
			if (!asset || asset.type !== 'image') return

			// scale so the max dimension is 1000px:
			const scale = Math.min(1000 / Math.max(asset.props.w, asset.props.h), 1)
			const center = editor.getViewportPageBounds().center
			const width = asset.props.w * scale
			const height = asset.props.h * scale

			// create an ID for the new shape so we can select it later:
			const shapeId = createShapeId()

			// create the shape, select it, make it fill the screen, and start cropping it:
			editor
				.createAssets([asset])
				.createShape({
					id: shapeId,
					type: 'image',
					x: center.x - width / 2,
					y: center.y - height / 2,
					props: {
						assetId: asset.id,
						w: width,
						h: height,
					},
				})
				.setSelectedShapes([shapeId])
				.zoomToSelection()
				.setCurrentTool('select.crop')
		})()
	})
</script>
