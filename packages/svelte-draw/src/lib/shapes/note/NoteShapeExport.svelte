<svelte:options namespace="svg" />

<script lang="ts">
	import type { Box, TLNoteShape, TLRichText } from '@svelte-draw/editor'
	import RichTextSVG from '../shared/RichTextSVG.svelte'
	import type { TLNoteShapeAttributionComponent } from './DefaultNoteShapeAttribution.svelte'

	/** The SVG export of a note shape: shadowed paper, label and (optional) attribution badge. */
	let {
		shape,
		isDarkMode,
		filterId,
		noteWidth,
		bounds,
		noteBackgroundColor,
		fontFamily,
		fontSize,
		lineHeight,
		textAlign,
		verticalAlign,
		richText,
		labelColor,
		padding,
		attribution,
		AttributionComponent,
	}: {
		shape: TLNoteShape
		isDarkMode: boolean
		filterId: string
		noteWidth: number
		bounds: Box
		noteBackgroundColor: string
		fontFamily: string
		fontSize: number
		lineHeight: number
		textAlign: 'start' | 'center' | 'end'
		verticalAlign: 'start' | 'middle' | 'end'
		richText: TLRichText
		labelColor: string
		padding: number
		attribution: { short: string; full: string } | null
		AttributionComponent: TLNoteShapeAttributionComponent
	} = $props()
</script>

{#if !isDarkMode}
	<rect
		rx={1}
		width={noteWidth}
		height={bounds.h}
		fill={noteBackgroundColor}
		filter="url(#{filterId})"
	/>
{/if}
<rect rx={1} width={noteWidth} height={bounds.h} fill={noteBackgroundColor} />
<RichTextSVG
	{fontSize}
	{fontFamily}
	{lineHeight}
	{textAlign}
	{verticalAlign}
	{richText}
	{labelColor}
	{bounds}
	{padding}
	showTextOutline={false}
/>
{#if attribution && AttributionComponent}
	<foreignObject x={0} y={0} width={noteWidth} height={bounds.h} class="tl-export-embed-styles">
		<div style="position: relative; width: 100%; height: 100%;">
			<AttributionComponent
				{shape}
				name={attribution.full}
				firstName={attribution.short}
				color={labelColor}
				scale={1}
				variant="export"
			/>
		</div>
	</foreignObject>
{/if}
