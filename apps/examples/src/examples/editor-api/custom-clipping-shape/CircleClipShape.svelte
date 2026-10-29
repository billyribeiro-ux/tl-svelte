<script lang="ts">
	import { SVGContainer, toDomPrecision } from 'svelte-draw'

	let {
		w,
		h,
		clippingEnabled,
		strokeWidth,
	}: { w: number; h: number; clippingEnabled: boolean; strokeWidth: number } = $props()

	const radius = $derived(Math.min(w, h) / 2)
	const centerX = $derived(w / 2)
	const centerY = $derived(h / 2)
</script>

<SVGContainer>
	<circle
		cx={toDomPrecision(centerX)}
		cy={toDomPrecision(centerY)}
		r={toDomPrecision(radius)}
		fill={clippingEnabled ? 'rgba(100, 150, 255, 0.1)' : 'rgba(150, 150, 150, 0.1)'}
		stroke={clippingEnabled ? '#4285f4' : '#999'}
		stroke-width={strokeWidth}
		stroke-dasharray={clippingEnabled ? 'none' : '5,5'}
	/>
	<text
		x={centerX}
		y={centerY + 4}
		text-anchor="middle"
		font-size="12"
		fill={clippingEnabled ? '#4285f4' : '#999'}
	>
		{clippingEnabled ? '✂️' : '○'}
	</text>
</SVGContainer>
