<svelte:options namespace="svg" />

<script lang="ts">
	import type { TLGeoShape } from '@svelte-draw/editor'
	import { View } from '@svelte-draw/svelte'
	import PatternFill from '../shared/PatternFill.svelte'
	import { getGeoShapePath, type GeoTypeDefinition } from './getGeoShapePath'

	let {
		shape,
		shouldScale,
		forceSolid,
		strokeColor,
		strokeWidth: unscaledStrokeWidth,
		fillColor,
		patternFillFallbackColor,
		customGeoTypes,
	}: {
		shape: TLGeoShape
		shouldScale: boolean
		forceSolid: boolean
		strokeColor: string
		strokeWidth: number
		fillColor: string
		patternFillFallbackColor: string
		customGeoTypes?: Record<string, GeoTypeDefinition>
	} = $props()

	const scaleToUse = $derived(shouldScale ? shape.props.scale : 1)
	const strokeWidth = $derived(unscaledStrokeWidth * scaleToUse)
	const dash = $derived(shape.props.dash)
	const fill = $derived(shape.props.fill)

	const path = $derived(getGeoShapePath(shape, unscaledStrokeWidth, customGeoTypes))
	const fillPath = $derived(
		dash === 'draw' && !forceSolid
			? path.toDrawD({
					strokeWidth,
					randomSeed: shape.id,
					passes: 1,
					offset: 0,
					onlyFilled: true,
				})
			: path.toD({ onlyFilled: true })
	)
	const strokeView = $derived(
		path.toSvg({
			style: dash,
			strokeWidth,
			forceSolid,
			randomSeed: shape.id,
			props: { fill: 'none', stroke: strokeColor },
		})
	)
</script>

{#if fill === 'none'}
	<!-- no fill -->
{:else if fill === 'pattern'}
	<PatternFill d={fillPath} {fillColor} {patternFillFallbackColor} scale={scaleToUse} />
{:else}
	<path fill={fillColor} d={fillPath} />
{/if}
<View view={strokeView} />
