<svelte:options namespace="svg" />

<script module lang="ts">
	/**
	 * One `<tspan>` of the SVG `<text>` element built by `createTextJsxFromSpans`. The tspans are
	 * precomputed so the helper stays a plain function.
	 */
	export interface TextSpansSvgTspan {
		x: number
		y: number
		text: string
		/** Whether this is a real text span (with `unicode-bidi`) rather than a line-break span. */
		isText: boolean
	}
</script>

<script lang="ts">
	let {
		fontSize,
		fontFamily,
		fontStyle,
		fontWeight,
		stroke,
		strokeWidth,
		fill,
		tspans,
	}: {
		fontSize: number
		fontFamily: string
		fontStyle?: string
		fontWeight?: string
		stroke?: string
		strokeWidth?: number
		fill?: string
		tspans: TextSpansSvgTspan[]
	} = $props()
</script>

<!-- No whitespace between the tspans: it would become part of the text content. -->
<text
	font-size={fontSize}
	font-family={fontFamily}
	font-style={fontStyle}
	font-weight={fontWeight}
	dominant-baseline="mathematical"
	alignment-baseline="mathematical"
	{stroke}
	stroke-width={strokeWidth}
	{fill}
>{#each tspans as tspan, i (i)}<tspan
			alignment-baseline="mathematical"
			x={tspan.x}
			y={tspan.y}
			unicode-bidi={tspan.isText ? 'plaintext' : undefined}>{tspan.text}</tspan
		>{/each}</text
>
