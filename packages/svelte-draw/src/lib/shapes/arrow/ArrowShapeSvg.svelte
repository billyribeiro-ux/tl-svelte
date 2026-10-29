<svelte:options namespace="svg" />

<script module lang="ts">
	import type { Box, TLArrowShape } from '@svelte-draw/editor'

	/** Props for the SVG export of an arrow, resolved by `ArrowShapeUtil.toSvg`. */
	export interface ArrowShapeSvgProps {
		shape: TLArrowShape
		strokeColor: string
		strokeWidth: number
		fillColor: string
		patternFillFallbackColor: string
		labelBorderRadius: number
		labelFontFamily: string
		labelFontSize: number
		labelLineHeight: number
		labelColor: string
		showTextOutline: boolean
		/** The label's box (already inset by the padding), or null when the arrow has no label. */
		labelBounds: Box | null
	}
</script>

<script lang="ts">
	import RichTextSVG from '../shared/RichTextSVG.svelte'
	import ArrowSvg from './ArrowSvg.svelte'

	let {
		shape,
		strokeColor,
		strokeWidth,
		fillColor,
		patternFillFallbackColor,
		labelBorderRadius,
		labelFontFamily,
		labelFontSize,
		labelLineHeight,
		labelColor,
		showTextOutline,
		labelBounds,
	}: ArrowShapeSvgProps = $props()
</script>

<g transform="scale({1 / shape.props.scale})">
	<ArrowSvg
		{shape}
		{strokeColor}
		{strokeWidth}
		{fillColor}
		{patternFillFallbackColor}
		{labelBorderRadius}
	/>
	{#if labelBounds}
		<RichTextSVG
			fontSize={labelFontSize * shape.props.scale}
			fontFamily={labelFontFamily}
			lineHeight={labelLineHeight}
			textAlign="center"
			verticalAlign="middle"
			{labelColor}
			richText={shape.props.richText}
			bounds={labelBounds}
			padding={0}
			{showTextOutline}
		/>
	{/if}
</g>
