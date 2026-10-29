<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { w, h, color, text }: { w: number; h: number; color: string; text: string } = $props()
</script>

<HTMLContainer
	class="media-card media-card--note"
	style="width: {w}px; height: {h}px; background-color: {color};"
>
	{text}
</HTMLContainer>
