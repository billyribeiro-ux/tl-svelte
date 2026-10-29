<script lang="ts">
	import ThumbnailImage from './ThumbnailImage.svelte'

	// The production ThumbnailImage signals data-thumbnail-ready/-error exactly as the render page
	// does; this wrapper additionally exposes the data URL for the capture script's local mode, which
	// reads the exact export bytes instead of screenshotting the viewport.
	let { dataUrl, width, height }: { dataUrl: string; width: number; height: number } = $props()

	$effect(() => {
		const w = window as unknown as { __svelteDrawThumbnailDataUrl?: string }
		w.__svelteDrawThumbnailDataUrl = dataUrl
		return () => {
			delete w.__svelteDrawThumbnailDataUrl
		}
	})
</script>

<ThumbnailImage src={dataUrl} {width} {height} />
