<svelte:options namespace="svg" />

<script lang="ts">
	import type { TLDrawShape } from '@svelte-draw/editor'
	import DrawShapeSvg from './DrawShapeSvg.svelte'

	let {
		scaleFactor,
		shape,
		strokeColor,
		strokeWidth,
		fillColor,
		patternFillFallbackColor,
	}: {
		scaleFactor: number
		shape: TLDrawShape
		strokeColor: string
		strokeWidth: number
		fillColor: string
		patternFillFallbackColor: string
	} = $props()
</script>

<g transform={`scale(${scaleFactor})`}>
	<DrawShapeSvg
		{shape}
		zoomOverride={1}
		{strokeColor}
		{strokeWidth}
		{fillColor}
		{patternFillFallbackColor}
	/>
</g>
