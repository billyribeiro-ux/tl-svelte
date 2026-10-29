<script lang="ts">
	import { getPerfectDashProps, type Box } from '@svelte-draw/editor'
	import { fromComputed, getEditor, SVGContainer } from '@svelte-draw/svelte'

	/**
	 * The dashed outline drawn around a focused group. Receives `{ bounds }` from the editor's
	 * `GroupShapeUtil.component()` (via `GroupShapeUtil.outlineComponent`) and wraps its own
	 * `<svg>`, because the React `component()` returned `<SVGContainer><DashedOutlineBox/></SVGContainer>`.
	 */
	let { bounds }: { bounds: Box } = $props()

	const editor = getEditor()
	const zoomLevel = fromComputed('zoom level', () => editor.getEfficientZoomLevel())

	const sides = $derived(
		bounds.sides.map((side) => {
			const { strokeDasharray, strokeDashoffset } = getPerfectDashProps(
				side[0].dist(side[1]),
				1 / zoomLevel.current,
				{
					style: 'dashed',
					lengthRatio: 4,
				}
			)
			return { side, strokeDasharray, strokeDashoffset }
		})
	)
</script>

<SVGContainer>
	<g class="tl-group" pointer-events="none" stroke-linecap="round" stroke-linejoin="round">
		{#each sides as { side, strokeDasharray, strokeDashoffset }, i (i)}
			<line
				x1={side[0].x}
				y1={side[0].y}
				x2={side[1].x}
				y2={side[1].y}
				stroke-dasharray={strokeDasharray}
				stroke-dashoffset={strokeDashoffset}
			/>
		{/each}
	</g>
</SVGContainer>
