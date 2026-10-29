<svelte:options namespace="svg" />

<script module lang="ts">
	import type { TLArrowShape, VecLike } from '@svelte-draw/editor'
	import type { SVGAttributes } from 'svelte/elements'
	import type { ElbowArrowEdge } from './definitions'

	export interface ElbowArrowDebugProps {
		arrow: TLArrowShape
	}

	type LineAttrs = SVGAttributes<SVGLineElement>
	type RectAttrs = SVGAttributes<SVGRectElement>
	type PolylineAttrs = SVGAttributes<SVGPolylineElement>
	type EdgeAttrs = Omit<LineAttrs, 'scale'>
</script>

<script lang="ts">
	import { Box } from '@svelte-draw/editor'
	import { getEditor } from '@svelte-draw/svelte'
	import { getArrowBindings } from '../shared'
	import { reactiveComputed } from '../reactiveComputed.svelte'
	import { getElbowArrowInfo } from './getElbowArrowInfo'

	let { arrow }: ElbowArrowDebugProps = $props()

	const editor = getEditor()
	const infoSignal = reactiveComputed(
		'elbow arrow grid',
		() => arrow,
		(arrow) => {
			try {
				return getElbowArrowInfo(editor, editor.getShape(arrow.id)!, getArrowBindings(editor, arrow))
			} catch (err) {
				console.error(err)
				return undefined
			}
		}
	)
	const info = $derived(infoSignal.current)
	const fullBox = $derived(
		info ? Box.Common([info.A.original, info.B.original]).expandBy(50) : undefined
	)
	const label = $derived(info?.route?.name ?? '')
	const midPoint = $derived(info?.route?.midpointHandle)
</script>

{#snippet debugLine(a: VecLike, b: VecLike, props: LineAttrs = {})}
	<line
		fill="none"
		stroke-width={1}
		stroke-dasharray="4,4"
		stroke="green"
		x1={a.x}
		y1={a.y}
		x2={b.x}
		y2={b.y}
		{...props}
	/>
{/snippet}

{#snippet debugRoute(route: VecLike[], props: PolylineAttrs = {})}
	<polyline
		fill="none"
		stroke="darkorchid"
		stroke-width={3}
		opacity={0.5}
		points={route.map((r) => `${r.x},${r.y}`).join(' ')}
		{...props}
	/>
{/snippet}

{#snippet debugEdge(edge: ElbowArrowEdge | null, axis: 'x' | 'y', props: EdgeAttrs = {})}
	{#if edge && edge.expanded !== null}
		{@const vec = (v: VecLike) => (axis === 'x' ? { x: v.y, y: v.x } : v)}
		{@const p1 = vec({ x: edge.expanded, y: edge.cross.min })}
		{@const p2 = vec({ x: edge.expanded, y: edge.cross.max })}
		{@const a1 = vec({ x: edge.expanded - 4, y: edge.cross.min })}
		{@const a2 = vec({ x: edge.expanded + 4, y: edge.cross.min })}
		{@const b1 = vec({ x: edge.expanded - 4, y: edge.cross.max })}
		{@const b2 = vec({ x: edge.expanded + 4, y: edge.cross.max })}
		<g>
			{@render debugLine(p1, p2, { 'stroke-dasharray': '0', 'stroke-width': 1.5, ...props })}
			{@render debugLine(a1, a2, { 'stroke-dasharray': '0', 'stroke-width': 1.5, ...props })}
			{@render debugLine(b1, b2, { 'stroke-dasharray': '0', 'stroke-width': 1.5, ...props })}
		</g>
	{/if}
{/snippet}

{#snippet debugBox(box: Box, props: RectAttrs = {})}
	<rect
		x={box.minX}
		y={box.minY}
		width={box.width}
		height={box.height}
		stroke-dasharray="4,4"
		stroke-width={1}
		fill="none"
		{...props}
	/>
{/snippet}

{#if info && fullBox}
	{#if info.midX !== null}
		{@render debugLine(
			{ x: info.midX, y: fullBox.minY },
			{ x: info.midX, y: fullBox.maxY },
			{ stroke: 'red' }
		)}
	{/if}
	{#if info.midY !== null}
		{@render debugLine(
			{ x: fullBox.minX, y: info.midY },
			{ x: fullBox.maxX, y: info.midY },
			{ stroke: 'blue' }
		)}
	{/if}

	{#if midPoint?.axis === 'x' && info.midXRange}
		{@render debugLine(
			{ x: info.midXRange.lo, y: midPoint.point.y },
			{ x: info.midXRange.hi, y: midPoint.point.y },
			{ stroke: 'red', 'stroke-dasharray': '0 2' }
		)}
	{/if}

	{#if midPoint?.axis === 'y' && info.midYRange}
		{@render debugLine(
			{ x: midPoint.point.x, y: info.midYRange.lo },
			{ x: midPoint.point.x, y: info.midYRange.hi },
			{ stroke: 'blue', 'stroke-dasharray': '0 2' }
		)}
	{/if}

	{@render debugBox(info.A.original, { stroke: 'orange' })}
	{@render debugBox(info.A.expanded, { stroke: 'orange', 'stroke-width': 0.5 })}
	{@render debugBox(info.A.original.clone().expandBy(info.options.minElbowLegLength), {
		stroke: 'orange',
		'stroke-width': 0.5,
	})}
	{@render debugBox(info.B.original, { stroke: 'lightskyblue' })}
	{@render debugBox(info.B.expanded, { stroke: 'lightskyblue', 'stroke-width': 0.5 })}
	{@render debugBox(info.B.original.clone().expandBy(info.options.minElbowLegLength), {
		stroke: 'lightskyblue',
		'stroke-width': 0.5,
	})}

	{@render debugEdge(info.A.edges.top, 'x', { stroke: 'orange' })}
	{@render debugEdge(info.B.edges.top, 'x', { stroke: 'lightskyblue' })}
	{@render debugEdge(info.A.edges.right, 'y', { stroke: 'orange' })}
	{@render debugEdge(info.B.edges.right, 'y', { stroke: 'lightskyblue' })}
	{@render debugEdge(info.A.edges.bottom, 'x', { stroke: 'orange' })}
	{@render debugEdge(info.B.edges.bottom, 'x', { stroke: 'lightskyblue' })}
	{@render debugEdge(info.A.edges.left, 'y', { stroke: 'orange' })}
	{@render debugEdge(info.B.edges.left, 'y', { stroke: 'lightskyblue' })}

	{#if info.route}
		{@render debugRoute(info.route.points, { 'stroke-width': 10 })}
	{/if}

	<text
		x={fullBox.minX + 5}
		y={fullBox.minY - 3}
		font-size={10}
		fill="black"
		stroke="var(--tl-color-background)"
		stroke-width={2}
		paint-order="stroke"
	>
		{label}
	</text>
	<text
		x={info.A.expanded.x}
		y={info.A.expanded.y}
		font-size={10}
		fill="black"
		stroke="var(--tl-color-background)"
		stroke-width={2}
		paint-order="stroke"
	>
		{'A' + (info.route ? `, ${info.route.aEdgePicking}` : '') + (info.A.isPoint ? ', point' : '')}
	</text>
	<text
		x={info.B.expanded.x}
		y={info.B.expanded.y}
		font-size={10}
		fill="black"
		stroke="var(--tl-color-background)"
		stroke-width={2}
		paint-order="stroke"
	>
		{'B' + (info.route ? `, ${info.route.bEdgePicking}` : '') + (info.B.isPoint ? ', point' : '')}
	</text>
{/if}
