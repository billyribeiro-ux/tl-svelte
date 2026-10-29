<script lang="ts">
	import type { TLShapeId } from '@svelte-draw/editor'
	import { SVGContainer } from '@svelte-draw/svelte'
	import FrameHeading from './FrameHeading.svelte'

	/** The canvas rendering of a frame: its body rect and, unless it is being created, its heading. */
	let {
		id,
		name,
		w,
		h,
		isCreating,
		showColors,
		fillColor,
		strokeColor,
		headingFill,
		headingStroke,
		headingColor,
	}: {
		id: TLShapeId
		name: string
		w: number
		h: number
		isCreating: boolean
		showColors: boolean
		fillColor: string
		strokeColor: string
		headingFill: string
		headingStroke: string
		headingColor: string
	} = $props()
</script>

<SVGContainer>
	<rect
		class={['tl-frame__body', isCreating && 'tl-frame__creating']}
		fill={fillColor}
		stroke={strokeColor}
		style:width="calc({w}px + 1px / var(--tl-zoom))"
		style:height="calc({h}px + 1px / var(--tl-zoom))"
		style:transform="translate(calc(-0.5px / var(--tl-zoom)), calc(-0.5px / var(--tl-zoom)))"
	/>
</SVGContainer>
{#if !isCreating}
	<FrameHeading
		{id}
		{name}
		fill={headingFill}
		stroke={headingStroke}
		color={headingColor}
		width={w}
		height={h}
		offsetX={showColors ? -1 : -7}
		{showColors}
	/>
{/if}
