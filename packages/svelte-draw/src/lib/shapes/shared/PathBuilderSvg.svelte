<svelte:options namespace="svg" />

<script module lang="ts">
	import type { SVGAttributes } from 'svelte/elements'

	/** One dash run of a dashed path. */
	export interface PathBuilderSvgDashedPart {
		d: string
		strokeDasharray: string
		strokeDashoffset: string
		markerStart?: string
		markerEnd?: string
	}

	/** @public */
	export type PathBuilderSvgProps =
		| {
				/** A single `<path>` (solid and draw styles). */
				kind: 'path'
				strokeWidth: number
				d: string
				attrs?: SVGAttributes<SVGPathElement & SVGGElement>
		  }
		| {
				/** A `<g>` of dashed `<path>` runs (dashed and dotted styles). */
				kind: 'dashed'
				strokeWidth: number
				parts: PathBuilderSvgDashedPart[]
				attrs?: SVGAttributes<SVGPathElement & SVGGElement>
		  }
</script>

<script lang="ts">
	let props: PathBuilderSvgProps = $props()
</script>

{#if props.kind === 'path'}
	<path stroke-width={props.strokeWidth} d={props.d} {...props.attrs as SVGAttributes<SVGPathElement>} />
{:else}
	<g stroke-width={props.strokeWidth} {...props.attrs as SVGAttributes<SVGGElement>}>
		{#each props.parts as part, i (i)}
			<path
				d={part.d}
				stroke-dasharray={part.strokeDasharray}
				stroke-dashoffset={part.strokeDashoffset}
				marker-start={part.markerStart}
				marker-end={part.markerEnd}
			/>
		{/each}
	</g>
{/if}
