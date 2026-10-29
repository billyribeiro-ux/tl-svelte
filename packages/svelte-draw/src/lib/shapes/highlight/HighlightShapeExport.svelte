<svelte:options namespace="svg" />

<script lang="ts">
	import type { TLHighlightShape } from '@svelte-draw/editor'
	import HighlightRenderer from './HighlightRenderer.svelte'

	let {
		scaleFactor,
		forceSolid,
		strokeWidth,
		shape,
		opacity,
		strokeColor,
	}: {
		scaleFactor: number
		forceSolid: boolean
		strokeWidth: number
		shape: TLHighlightShape
		opacity: number
		strokeColor: string
	} = $props()
</script>

<g transform={`scale(${scaleFactor})`}>
	<HighlightRenderer {forceSolid} {strokeWidth} {shape} {opacity} {strokeColor} />
</g>
