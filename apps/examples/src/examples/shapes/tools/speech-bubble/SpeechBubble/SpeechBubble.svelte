<script lang="ts">
	import { PlainTextLabel, type PlainTextLabelProps } from 'svelte-draw'

	let {
		shapeId,
		type,
		pathData,
		strokeWidth,
		color,
		fontFamily,
		textWidth,
		fontSize,
		lineHeight,
		textAlign,
		text,
		isSelected,
	}: {
		shapeId: PlainTextLabelProps['shapeId']
		type: PlainTextLabelProps['type']
		pathData: string
		strokeWidth: number
		color: string
		fontFamily: string
		textWidth: number
		fontSize: number
		lineHeight: number
		textAlign: 'start' | 'center' | 'end'
		text: string
		isSelected: boolean
	} = $props()
</script>

<svg class="tl-svg-container">
	<path d={pathData} stroke-width={strokeWidth} stroke={color} fill="none" />
</svg>
<PlainTextLabel
	{shapeId}
	{type}
	{fontFamily}
	{textWidth}
	{fontSize}
	{lineHeight}
	{textAlign}
	verticalAlign="start"
	{text}
	labelColor={color}
	{isSelected}
	wrap
/>
