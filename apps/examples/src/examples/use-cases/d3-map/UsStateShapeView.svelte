<script lang="ts">
	import { SVGContainer } from 'svelte-draw'

	let {
		scaleX,
		scaleY,
		pathData,
		fill,
		pathOffsetX,
		pathOffsetY,
		name,
	}: {
		scaleX: number
		scaleY: number
		pathData: string
		fill: string
		pathOffsetX: number
		pathOffsetY: number
		name: string
	} = $props()
</script>

<SVGContainer>
	<g transform={`scale(${scaleX}, ${scaleY}) translate(${-pathOffsetX}, ${-pathOffsetY})`}>
		<path d={pathData} {fill} stroke="#fff" stroke-width={1 / scaleX} stroke-linejoin="round" />
	</g>
</SVGContainer>
<div class="d3-map-state-label" style="pointer-events: none; font-size: calc(11px * var(--tl-scale));">
	{name}
</div>
