<script lang="ts">
	import type { Attachment } from 'svelte/attachments'
	import {
		setThumbnailError,
		signalThumbnailReady,
		signalThumbnailReadyIfComplete,
	} from '../thumbnail-render'

	// Displays the exported PNG at the exact output size and signals readiness once it has painted, so
	// the worker's screenshot (which waits on data-thumbnail-ready) captures the export pixel-for-pixel.
	// The editor DOM is gone by now — this replaces it in the same update — so the
	// page is quiescent when the screenshot is taken. Also used by the dev fixture page
	// (dev-browser-run-thumbnail.svelte), so its ready/error markers stay identical to production's.
	let { src, width, height }: { src: string; width: number; height: number } = $props()

	// Runs after the element has its `src`. `load` can already have fired by then.
	const checkComplete: Attachment<HTMLImageElement> = (img) => {
		signalThumbnailReadyIfComplete(img)
	}
</script>

<img
	{@attach checkComplete}
	{src}
	alt=""
	style:display="block"
	style:width="{width}px"
	style:height="{height}px"
	onload={signalThumbnailReady}
	onerror={() => setThumbnailError('thumbnail image failed to load')}
/>
