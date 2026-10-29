<script lang="ts">
	import { HTMLContainer } from 'svelte-draw'

	let { w, h, color }: { w: number; h: number; color: string } = $props()
</script>

<!-- [a] -->
<HTMLContainer>
	<div
		style:width="{w}px"
		style:height="{h}px"
		style:border="1px solid black"
		style:background-color={color}
		style:pointer-events="all"
	></div>
</HTMLContainer>
