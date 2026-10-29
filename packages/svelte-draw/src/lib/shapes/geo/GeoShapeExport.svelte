<svelte:options namespace="svg" />

<script lang="ts">
	import type { Box, TLGeoShape, TLRichText } from '@svelte-draw/editor'
	import RichTextSVG from '../shared/RichTextSVG.svelte'
	import GeoShapeBody from './GeoShapeBody.svelte'
	import type { GeoTypeDefinition } from './getGeoShapePath'

	/** The SVG export of a geo shape: its body (scaled to 1x) and its label, if it has one. */
	let {
		shape,
		strokeColor,
		strokeWidth,
		fillColor,
		patternFillFallbackColor,
		customGeoTypes,
		richText,
		textBounds,
		labelFontFamily,
		labelFontSize,
		labelLineHeight,
		labelPadding,
		labelHorizontalAlign,
		labelVerticalAlign,
		labelColor,
		showTextOutline,
	}: {
		shape: TLGeoShape
		strokeColor: string
		strokeWidth: number
		fillColor: string
		patternFillFallbackColor: string
		customGeoTypes?: Record<string, GeoTypeDefinition>
		/** `null` when the label is empty and no text is exported. */
		richText: TLRichText | null
		textBounds: Box
		labelFontFamily: string
		labelFontSize: number
		labelLineHeight: number
		labelPadding: number
		labelHorizontalAlign: 'start' | 'center' | 'end'
		labelVerticalAlign: 'start' | 'middle' | 'end'
		labelColor: string
		showTextOutline: boolean
	} = $props()
</script>

<GeoShapeBody
	shouldScale={false}
	{shape}
	forceSolid={false}
	{strokeColor}
	{strokeWidth}
	{fillColor}
	{patternFillFallbackColor}
	{customGeoTypes}
/>
{#if richText}
	<RichTextSVG
		fontSize={labelFontSize}
		fontFamily={labelFontFamily}
		lineHeight={labelLineHeight}
		textAlign={labelHorizontalAlign}
		verticalAlign={labelVerticalAlign}
		{labelColor}
		padding={labelPadding}
		{showTextOutline}
		bounds={textBounds}
		{richText}
	/>
{/if}
