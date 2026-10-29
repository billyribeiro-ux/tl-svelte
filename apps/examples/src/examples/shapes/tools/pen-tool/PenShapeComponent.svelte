<script lang="ts">
	import { SVGContainer } from '@svelte-draw/svelte'
	import PenPath from './PenPath.svelte'
	import type { PenPathProps } from './PenShapeUtil'

	let {
		pathProps,
		zoom,
		preview,
		controlLines,
	}: { pathProps: PenPathProps; zoom: number; preview?: string; controlLines: string[] } = $props()
</script>

<SVGContainer>
	<PenPath {...pathProps} />
	{#if preview}
		<path
			d={preview}
			fill="none"
			stroke="var(--tl-color-selected)"
			stroke-width={1 / zoom}
			stroke-dasharray="{4 / zoom} {4 / zoom}"
		/>
	{/if}
	{#each controlLines as line, i (i)}
		<path
			d={line}
			fill="none"
			stroke="var(--tl-color-selected)"
			stroke-width={1 / zoom}
			stroke-dasharray="{3 / zoom} {3 / zoom}"
		/>
	{/each}
</SVGContainer>
