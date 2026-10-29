<script lang="ts">
	import { SVGContainer, getPerfectDashProps, type Vec } from 'svelte-draw'

	let {
		sides,
		zoomLevel,
		index,
		onLabelPointerDown,
	}: {
		sides: Vec[][]
		zoomLevel: number
		index: number
		onLabelPointerDown(): void
	} = $props()
</script>

<!-- [3] -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onpointerdown={onLabelPointerDown} class="slide-shape-label">
	{`Slide ${index + 1}`}
</div>
<SVGContainer>
	<g
		style="stroke: var(--tl-color-text); stroke-width: calc(1px * var(--tl-scale)); opacity: 0.25;"
		pointer-events="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		{#each sides as side, i (i)}
			{@const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
				side[0].dist(side[1]),
				1 / zoomLevel,
				{
					style: 'dashed',
					lengthRatio: 6,
					forceSolid: zoomLevel < 0.2,
				}
			)}
			<line
				x1={side[0].x}
				y1={side[0].y}
				x2={side[1].x}
				y2={side[1].y}
				stroke-dasharray={strokeDasharray}
				stroke-dashoffset={strokeDashoffset}
			/>
		{/each}
	</g>
</SVGContainer>
