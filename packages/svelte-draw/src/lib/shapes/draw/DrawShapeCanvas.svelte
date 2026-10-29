<script lang="ts">
	import type { TLDrawShape } from '@svelte-draw/editor'
	import { SVGContainer } from '@svelte-draw/svelte'
	import DrawShapeSvg from './DrawShapeSvg.svelte'

	let {
		shape,
		strokeColor,
		strokeWidth,
		fillColor,
		patternFillFallbackColor,
	}: {
		shape: TLDrawShape
		strokeColor: string
		strokeWidth: number
		fillColor: string
		patternFillFallbackColor: string
	} = $props()
</script>

<SVGContainer>
	<DrawShapeSvg {shape} {strokeColor} {strokeWidth} {fillColor} {patternFillFallbackColor} />
</SVGContainer>
