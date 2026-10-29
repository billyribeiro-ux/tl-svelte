<script lang="ts">
	import { SVGContainer } from '@svelte-draw/svelte'

	let {
		cx,
		cy,
		rx,
		ry,
		fill,
		stroke,
		glow,
	}: {
		cx: number
		cy: number
		rx: number
		ry: number
		fill: string
		stroke: string
		glow: string
	} = $props()
</script>

<SVGContainer>
	<ellipse
		{cx}
		{cy}
		{rx}
		{ry}
		{fill}
		{stroke}
		stroke-width={3}
		style="filter: drop-shadow(0 0 12px {glow})"
	/>
</SVGContainer>
