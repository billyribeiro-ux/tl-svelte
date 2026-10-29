<script lang="ts">
	import type { TLGeoShape, TLShapeId } from '@svelte-draw/editor'
	import { HTMLContainer, SVGContainer } from '@svelte-draw/svelte'
	import HyperlinkButton from '../shared/HyperlinkButton.svelte'
	import RichTextLabel from '../shared/RichTextLabel.svelte'
	import GeoShapeBody from './GeoShapeBody.svelte'
	import type { GeoTypeDefinition } from './getGeoShapePath'

	/** The canvas rendering of a geo shape: its body, its (optional) rich text label and its link. */
	let {
		shape,
		isForceSolid,
		isOnlySelected,
		showHtmlContainer,
		strokeColor,
		strokeWidth,
		fillColor,
		patternFillFallbackColor,
		customGeoTypes,
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
		isForceSolid: boolean
		isOnlySelected: boolean
		showHtmlContainer: boolean
		strokeColor: string
		strokeWidth: number
		fillColor: string
		patternFillFallbackColor: string
		customGeoTypes?: Record<string, GeoTypeDefinition>
		labelFontFamily: string
		labelFontSize: number
		labelLineHeight: number
		labelPadding: number
		labelHorizontalAlign: 'start' | 'center' | 'end'
		labelVerticalAlign: 'start' | 'middle' | 'end'
		labelColor: string
		showTextOutline: boolean
	} = $props()

	const id: TLShapeId = $derived(shape.id)
	const geoProps = $derived(shape.props)
	const scaledLabelStyle = $derived(
		geoProps.scale !== 1
			? {
					transform: `scale(${geoProps.scale})`,
					transformOrigin: 'top left',
					width: geoProps.w / geoProps.scale,
					height: (geoProps.h + geoProps.growY) / geoProps.scale,
				}
			: undefined
	)
</script>

<SVGContainer>
	<GeoShapeBody
		{shape}
		shouldScale={true}
		forceSolid={isForceSolid}
		{strokeColor}
		{strokeWidth}
		{fillColor}
		{patternFillFallbackColor}
		{customGeoTypes}
	/>
</SVGContainer>
{#if showHtmlContainer}
	<HTMLContainer style="overflow: hidden; width: {geoProps.w}px; height: {geoProps.h + geoProps.growY}px;">
		<RichTextLabel
			shapeId={id}
			type={shape.type}
			fontFamily={labelFontFamily}
			fontSize={labelFontSize}
			lineHeight={labelLineHeight}
			padding={labelPadding}
			textAlign={labelHorizontalAlign}
			verticalAlign={labelVerticalAlign}
			richText={geoProps.richText}
			isSelected={isOnlySelected}
			{labelColor}
			wrap
			{showTextOutline}
			style={scaledLabelStyle}
		/>
	</HTMLContainer>
{/if}
{#if geoProps.url}
	<HyperlinkButton url={geoProps.url} />
{/if}
