<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'

	let { w, h, slotSize }: { w: number; h: number; slotSize: number } = $props()
</script>

<HTMLContainer
	style="background-color: #efefef; border-right: 1px solid #ccc; border-bottom: 1px solid #ccc; background-size: {slotSize}px {slotSize}px; width: {w}px; height: {h}px; background-image: linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px);"
></HTMLContainer>
