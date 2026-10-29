<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { w, h, url }: { w: number; h: number; url: string } = $props()
</script>

<HTMLContainer class="media-card media-card--video" style="width: {w}px; height: {h}px;">
	<video src={url} autoplay muted loop playsinline></video>
</HTMLContainer>
