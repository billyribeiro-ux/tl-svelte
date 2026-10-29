<script lang="ts">
	import { THUMBNAIL_SETTLE_TIMEOUT_MS } from '@svelte-draw/dotcom-shared'
	import { getEditor } from 'svelte-draw'
	import { runThumbnailExport } from '../thumbnail-render'

	// See runThumbnailExport for what this does and why. Must be rendered inside <SvelteDraw>.
	let {
		theme,
		width,
		height,
		camera,
		shapeIds,
		settleTimeoutMs = THUMBNAIL_SETTLE_TIMEOUT_MS,
		capture,
		onImage,
	}: {
		theme: 'light' | 'dark'
		width: number
		height: number
		camera?: 'content'
		shapeIds?: string[]
		settleTimeoutMs?: number
		/** `live`: signal ready after settle and fit, without exporting — see ThumbnailRenderParams. */
		capture?: 'live'
		onImage(blob: Blob): void | Promise<void>
	} = $props()

	const editor = getEditor()

	$effect(() =>
		runThumbnailExport(editor, {
			theme,
			width,
			height,
			camera,
			shapeIds,
			settleTimeoutMs,
			capture,
			onImage,
		})
	)
</script>
