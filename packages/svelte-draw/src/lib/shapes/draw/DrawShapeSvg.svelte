<svelte:options namespace="svg" />

<script lang="ts">
	import { last, rng, type TLDrawShape } from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import { getStrokePoints } from '../shared/freehand/getStrokePoints'
	import { getSvgPathFromStrokePoints } from '../shared/freehand/svg'
	import { svgInk } from '../shared/freehand/svgInk'
	import PatternFill from '../shared/PatternFill.svelte'
	import { getDot } from './getDot'
	import {
		getDrawShapeStrokeDashArray,
		getFreehandOptions,
		getPointsFromDrawSegments,
	} from './getPath'

	let {
		shape,
		zoomOverride,
		strokeColor,
		strokeWidth: baseStrokeWidth,
		fillColor,
		patternFillFallbackColor,
	}: {
		shape: TLDrawShape
		zoomOverride?: number
		strokeColor: string
		strokeWidth: number
		fillColor: string
		patternFillFallbackColor: string
	} = $props()

	const editor = getEditor()

	const allPointsFromSegments = $derived(
		getPointsFromDrawSegments(shape.props.segments, shape.props.scaleX, shape.props.scaleY)
	)

	const showAsComplete = $derived(
		shape.props.isComplete || last(shape.props.segments)?.type === 'straight'
	)

	const baseSw = $derived((baseStrokeWidth + 1) * shape.props.scale)

	const zoomLevel = fromComputed('zoomLevel', () => editor.getEfficientZoomLevel())
	const forceSolid = $derived.by(() => {
		const zoom = zoomOverride ?? zoomLevel.current
		return zoom < 0.5 && zoom < 1.5 / baseSw
	})

	// If we're zoomed way out (10%), then we need to make the dotted line go to 9 instead 0.1
	// Chrome doesn't render anything otherwise.
	const dotAdjustment = $derived((zoomOverride ?? zoomLevel.current) < 0.2 ? 9 : 0.1)

	const sw = $derived(
		!forceSolid &&
			!shape.props.isPen &&
			shape.props.dash === 'draw' &&
			allPointsFromSegments.length === 1
			? baseSw + rng(shape.id)() * (baseSw / 6)
			: baseSw
	)

	const options = $derived(getFreehandOptions(shape.props, sw, showAsComplete, forceSolid))

	const isDrawStyle = $derived(!forceSolid && shape.props.dash === 'draw')

	// draw style
	const drawFillPath = $derived(
		isDrawStyle &&
			shape.props.isClosed &&
			shape.props.fill !== 'none' &&
			allPointsFromSegments.length > 1
			? getSvgPathFromStrokePoints(
					getStrokePoints(allPointsFromSegments, options),
					shape.props.isClosed
				)
			: null
	)
	const inkPath = $derived(isDrawStyle ? svgInk(allPointsFromSegments, options) : '')

	// solid / dashed / dotted style
	const solid = $derived.by(() => {
		if (isDrawStyle) return null
		const strokePoints = getStrokePoints(allPointsFromSegments, options)
		const isDot = strokePoints.length < 2
		const fill = isDot || shape.props.isClosed ? shape.props.fill : 'none'
		const path = isDot
			? getDot(allPointsFromSegments[0] ?? { x: 0, y: 0 }, 0)
			: getSvgPathFromStrokePoints(strokePoints, shape.props.isClosed && fill !== 'none')
		return { isDot, fill, path }
	})
</script>

{#if isDrawStyle}
	{#if drawFillPath !== null}
		{#if shape.props.fill === 'pattern'}
			<PatternFill
				d={drawFillPath}
				{fillColor}
				{patternFillFallbackColor}
				scale={shape.props.scale}
			/>
		{:else}
			<path fill={fillColor} d={drawFillPath} />
		{/if}
	{/if}
	<path d={inkPath} stroke-linecap="round" fill={strokeColor} />
{:else if solid}
	{#if !(solid.isDot || !shape.props.isClosed || solid.fill === 'none')}
		{#if solid.fill === 'pattern'}
			<PatternFill
				d={solid.path}
				{fillColor}
				{patternFillFallbackColor}
				scale={shape.props.scale}
			/>
		{:else}
			<path fill={fillColor} d={solid.path} />
		{/if}
	{/if}
	{#if shape.props.dash !== 'none'}
		<path
			d={solid.path}
			stroke-linecap="round"
			fill={solid.isDot ? strokeColor : 'none'}
			stroke={strokeColor}
			stroke-width={sw}
			stroke-dasharray={solid.isDot
				? 'none'
				: getDrawShapeStrokeDashArray(shape, sw, dotAdjustment)}
			stroke-dashoffset="0"
		/>
	{/if}
{/if}
