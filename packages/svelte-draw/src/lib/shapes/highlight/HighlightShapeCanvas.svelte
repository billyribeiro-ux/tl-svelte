<script lang="ts">
	import type { TLHighlightShape } from '@svelte-draw/editor'
	import { fromComputed, getEditor, SVGContainer } from '@svelte-draw/svelte'
	import HighlightRenderer from './HighlightRenderer.svelte'

	let {
		shape,
		strokeWidth,
		opacity,
		strokeColor,
	}: {
		shape: TLHighlightShape
		strokeWidth: number
		opacity: number
		strokeColor: string
	} = $props()

	const editor = getEditor()
	const zoomLevel = fromComputed('zoomLevel', () => editor.getEfficientZoomLevel())
	const forceSolid = $derived(strokeWidth / zoomLevel.current < 1.5)
</script>

<SVGContainer>
	<HighlightRenderer {shape} {forceSolid} {strokeWidth} {opacity} {strokeColor} />
</SVGContainer>
