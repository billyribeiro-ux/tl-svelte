<script lang="ts">
	import { HTMLContainer } from '@svelte-draw/svelte'
	import type { VecLike } from 'svelte-draw'

	let {
		d,
		start,
		end,
		cp1,
		cp2,
		zoomLevel,
		showControlLines,
	}: {
		d: string
		start: VecLike
		end: VecLike
		cp1: VecLike
		cp2: VecLike
		zoomLevel: number
		showControlLines: boolean
	} = $props()
</script>

<HTMLContainer>
	<svg class="tl-svg-container">
		<path {d} stroke="black" fill="transparent" />
		{#if showControlLines}
			<line
				x1={start.x}
				y1={start.y}
				x2={cp1.x}
				y2={cp1.y}
				stroke="black"
				stroke-width={1 / zoomLevel}
				stroke-dasharray="{6 / zoomLevel} {6 / zoomLevel}"
				opacity={0.5}
			/>
			<line
				x1={end.x}
				y1={end.y}
				x2={cp2.x}
				y2={cp2.y}
				stroke="black"
				stroke-width={1 / zoomLevel}
				stroke-dasharray="{6 / zoomLevel} {6 / zoomLevel}"
				opacity={0.5}
			/>
		{/if}
	</svg>
</HTMLContainer>
