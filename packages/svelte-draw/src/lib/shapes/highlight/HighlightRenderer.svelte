<svelte:options namespace="svg" />

<script lang="ts">
	import { last, rng, type TLHighlightShape } from '@svelte-draw/editor'
	import { getHighlightFreehandSettings, getPointsFromDrawSegments } from '../draw/getPath'
	import { getStrokePoints } from '../shared/freehand/getStrokePoints'
	import { getSvgPathFromStrokePoints } from '../shared/freehand/svg'

	let {
		strokeWidth,
		forceSolid,
		shape,
		opacity,
		strokeColor,
	}: {
		strokeWidth: number
		forceSolid: boolean
		shape: TLHighlightShape
		opacity: number
		strokeColor: string
	} = $props()

	const allPointsFromSegments = $derived(
		getPointsFromDrawSegments(shape.props.segments, shape.props.scaleX, shape.props.scaleY)
	)

	const sw = $derived(
		!forceSolid && !shape.props.isPen && allPointsFromSegments.length === 1
			? strokeWidth + rng(shape.id)() * (strokeWidth / 6)
			: strokeWidth
	)

	const solidStrokePath = $derived.by(() => {
		const options = getHighlightFreehandSettings({
			strokeWidth: sw,
			showAsComplete: shape.props.isComplete || last(shape.props.segments)?.type === 'straight',
		})
		const strokePoints = getStrokePoints(allPointsFromSegments, options)
		return strokePoints.length > 1
			? getSvgPathFromStrokePoints(strokePoints, false)
			: getShapeDot(allPointsFromSegments[0] ?? { x: 0, y: 0 })
	})

	function getShapeDot(point: { x: number; y: number }) {
		const r = 0.1
		return `M ${point.x} ${point.y} m -${r}, 0 a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${
			r * 2
		},0`
	}
</script>

<path
	d={solidStrokePath}
	stroke-linecap="round"
	fill="none"
	pointer-events="all"
	stroke={strokeColor}
	stroke-width={sw}
	{opacity}
/>
