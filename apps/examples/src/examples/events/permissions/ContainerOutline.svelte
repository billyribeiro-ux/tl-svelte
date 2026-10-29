<script lang="ts">
	import { SVGContainer } from '@svelte-draw/svelte'
	import { CONTAINER_BOUNDS } from './bounds'
</script>

<SVGContainer>
	<rect
		x={CONTAINER_BOUNDS.x}
		y={CONTAINER_BOUNDS.y}
		width={CONTAINER_BOUNDS.w}
		height={CONTAINER_BOUNDS.h}
		fill="none"
		stroke="rgba(0, 0, 0, 0.2)"
		stroke-width={2}
		stroke-dasharray="8 4"
	/>
</SVGContainer>
