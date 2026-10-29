<script lang="ts">
	import { SVGContainer } from '@svelte-draw/svelte'
	import { fromComputed, getEditor, toDomPrecision } from 'svelte-draw'
	import { buildGlobPath, getGlobInfo, type GlobShape } from './GlobShapeUtil'

	let { shape, showControlLines }: { shape: GlobShape; showControlLines: boolean } = $props()

	const editor = getEditor()

	// Everything the old `track`ed component read while rendering, as one computed so it re-runs
	// when the zoom, the Space key, the selection, or the nodes this glob spans change.
	const view = $derived(
		fromComputed('glob view', () => {
			const zoomLevel = editor.getZoomLevel()

			// Use reactive inputs to track if space key is pressed
			const fillGlob = editor.inputs.keys.has('Space')
			const isSelected = editor.getSelectedShapeIds().includes(shape.id)

			const globPoints = getGlobInfo(editor, shape)
			if (!globPoints) return null

			const pathBuilder = buildGlobPath(globPoints)
			if (!pathBuilder) return null

			const lines = [
				{
					x1: shape.props.edges.edgeA.d.x,
					y1: shape.props.edges.edgeA.d.y,
					x2: globPoints.edgeA.tangentA.x,
					y2: globPoints.edgeA.tangentA.y,
				},
				{
					x1: shape.props.edges.edgeA.d.x,
					y1: shape.props.edges.edgeA.d.y,
					x2: globPoints.edgeA.tangentB.x,
					y2: globPoints.edgeA.tangentB.y,
				},
				{
					x1: shape.props.edges.edgeB.d.x,
					y1: shape.props.edges.edgeB.d.y,
					x2: globPoints.edgeB.tangentA.x,
					y2: globPoints.edgeB.tangentA.y,
				},
				{
					x1: shape.props.edges.edgeB.d.x,
					y1: shape.props.edges.edgeB.d.y,
					x2: globPoints.edgeB.tangentB.x,
					y2: globPoints.edgeB.tangentB.y,
				},
			].map((line) => ({
				x1: toDomPrecision(line.x1),
				y1: toDomPrecision(line.y1),
				x2: toDomPrecision(line.x2),
				y2: toDomPrecision(line.y2),
			}))

			return { zoomLevel, fillGlob, isSelected, d: pathBuilder.toD(), lines }
		})
	)
</script>

{#if view.current}
	{@const v = view.current}
	<SVGContainer>
		{#if showControlLines}
			{#each v.lines as line, i (i)}
				<!-- ControlLine -->
				<line
					x1={line.x1}
					y1={line.y1}
					x2={line.x2}
					y2={line.y2}
					stroke="#4169E1"
					stroke-dasharray="{3 / v.zoomLevel} {3 / v.zoomLevel}"
					stroke-width={1 / v.zoomLevel}
				/>
			{/each}
		{/if}
		<path
			d={v.d}
			stroke="black"
			fill={v.fillGlob ? 'black' : 'white'}
			opacity={v.fillGlob ? 1 : 0.75}
			stroke-width={2 / v.zoomLevel}
		/>
		{#if v.isSelected}
			<path d={v.d} pointer-events="none" fill="blue" opacity={0.25} />
		{/if}
	</SVGContainer>
{/if}
