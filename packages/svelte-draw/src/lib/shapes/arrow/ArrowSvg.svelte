<svelte:options namespace="svg" />

<script module lang="ts">
	import type { TLArrowShape } from '@svelte-draw/editor'

	export interface ArrowSvgProps {
		shape: TLArrowShape
		strokeColor: string
		strokeWidth: number
		fillColor: string
		patternFillFallbackColor: string
		labelBorderRadius?: number
	}
</script>

<script lang="ts">
	import { Box, toDomPrecision } from '@svelte-draw/editor'
	import { getEditor, getSharedSafeId, View } from '@svelte-draw/svelte'
	import { isEmptyRichText } from '../../utils/text/richText'
	import PatternFill from '../shared/PatternFill.svelte'
	import { useEfficientZoomThreshold } from '../shared/useEfficientZoomThreshold.svelte'
	import { getArrowheadPathForType } from './arrowheads'
	import { getArrowLabelPosition } from './arrowLabel'
	import { getArrowBodyPath } from './ArrowPath'
	import ArrowClipPath from './ArrowClipPath.svelte'
	import { getArrowInfo } from './getArrowInfo'
	import { reactiveComputed } from './reactiveComputed.svelte'

	let {
		shape,
		strokeColor,
		strokeWidth: baseStrokeWidth,
		fillColor,
		patternFillFallbackColor,
		labelBorderRadius = 3.5,
	}: ArrowSvgProps = $props()

	const editor = getEditor()
	const isForceSolid = useEfficientZoomThreshold(() => 0.25 / shape.props.scale)
	// svelte-ignore state_referenced_locally
	const clipPathId = getSharedSafeId(shape.id + '_clip')

	// Everything that reads editor signals, mirroring the body of the React `track()`ed component.
	const state = reactiveComputed(
		'arrow svg',
		() => ({ shape, baseStrokeWidth }),
		({ shape, baseStrokeWidth }) => {
			const info = getArrowInfo(editor, shape)
			const isEditing = editor.getEditingShapeId() === shape.id
			const geometry = editor.getShapeGeometry(shape)
			if (!geometry) return null
			const bounds = Box.ZeroFix(geometry.bounds)
			if (!info?.isValid) return null

			const strokeWidth = baseStrokeWidth * shape.props.scale
			const as = info.start.arrowhead && getArrowheadPathForType(info, 'start', strokeWidth)
			const ae = info.end.arrowhead && getArrowheadPathForType(info, 'end', strokeWidth)
			const labelPosition = getArrowLabelPosition(editor, shape, isEditing)

			return {
				info,
				isEditing,
				bounds,
				strokeWidth,
				as,
				ae,
				labelBox: labelPosition.box,
				clipStartArrowhead: !(info.start.arrowhead === 'none' || info.start.arrowhead === 'arrow'),
				clipEndArrowhead: !(info.end.arrowhead === 'none' || info.end.arrowhead === 'arrow'),
			}
		}
	)

	const s = $derived(state.current)
	const isEmpty = $derived(isEmptyRichText(shape.props.richText))
	const bodyView = $derived(
		s
			? getArrowBodyPath(shape, s.info, {
					style: shape.props.dash,
					strokeWidth: s.strokeWidth,
					forceSolid: isForceSolid.current,
					randomSeed: shape.id,
				})
			: null
	)
</script>

{#if s}
	<defs>
		<clipPath id={clipPathId}>
			<ArrowClipPath
				radius={labelBorderRadius * shape.props.scale}
				hasText={s.isEditing || !isEmpty}
				bounds={s.bounds}
				labelBounds={s.labelBox}
				as={s.clipStartArrowhead && s.as ? s.as : ''}
				ae={s.clipEndArrowhead && s.ae ? s.ae : ''}
			/>
		</clipPath>
	</defs>
	<g
		fill="none"
		stroke={strokeColor}
		stroke-width={s.strokeWidth}
		stroke-linejoin="round"
		stroke-linecap="round"
		pointer-events="none"
	>
		<g style="clip-path: url(#{clipPathId}); -webkit-clip-path: url(#{clipPathId});">
			<rect
				x={toDomPrecision(s.bounds.minX - 100)}
				y={toDomPrecision(s.bounds.minY - 100)}
				width={toDomPrecision(s.bounds.width + 200)}
				height={toDomPrecision(s.bounds.height + 200)}
				opacity={0}
			/>
			<View view={bodyView} />
		</g>
		{#if s.as && s.clipStartArrowhead && shape.props.fill !== 'none'}
			{#if shape.props.fill === 'pattern'}
				<PatternFill
					d={s.as}
					{fillColor}
					{patternFillFallbackColor}
					scale={shape.props.scale}
				/>
			{:else}
				<path fill={fillColor} d={s.as} />
			{/if}
		{/if}
		{#if s.ae && s.clipEndArrowhead && shape.props.fill !== 'none'}
			{#if shape.props.fill === 'pattern'}
				<PatternFill
					d={s.ae}
					{fillColor}
					{patternFillFallbackColor}
					scale={shape.props.scale}
				/>
			{:else}
				<path fill={fillColor} d={s.ae} />
			{/if}
		{/if}
		{#if s.as}<path d={s.as} />{/if}
		{#if s.ae}<path d={s.ae} />{/if}
	</g>
{/if}
