<svelte:options namespace="svg" />

<script lang="ts">
	import type { ShapeView } from '@svelte-draw/editor'
	import { View } from '@svelte-draw/svelte'

	/** The SVG export of a frame: body rect, heading box and the heading text view. */
	let {
		w,
		h,
		fillColor,
		strokeColor,
		showColors,
		labelTranslate,
		headingText,
		headingFill,
		headingStroke,
		labelX,
		labelY,
		labelWidth,
		labelHeight,
		text,
	}: {
		w: number
		h: number
		fillColor: string
		strokeColor: string
		showColors: boolean
		labelTranslate: string
		headingText: string
		headingFill: string
		headingStroke: string
		labelX: number
		labelY: number
		labelWidth: number
		labelHeight: number
		text: ShapeView | null
	} = $props()
</script>

<rect width={w} height={h} fill={fillColor} stroke={strokeColor} stroke-width={1} x={0} rx={0} ry={0} />
<g fill={headingText} transform={labelTranslate}>
	<rect
		x={labelX}
		y={labelY}
		width={labelWidth}
		height={labelHeight}
		fill={headingFill}
		stroke={headingStroke}
		rx={4}
		ry={4}
	/>
	<g transform="translate({showColors ? 8 : 0}, 4)"><View view={text} /></g>
</g>
