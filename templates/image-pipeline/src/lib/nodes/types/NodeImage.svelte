<script lang="ts">
	/**
	 * An image element that hides itself if the source fails to load.
	 */
	let { src, alt }: { src: string; alt: string } = $props()
</script>

<img
	{src}
	{alt}
	onerror={(e) => {
		;(e.currentTarget as HTMLImageElement).style.display = 'none'
	}}
/>
