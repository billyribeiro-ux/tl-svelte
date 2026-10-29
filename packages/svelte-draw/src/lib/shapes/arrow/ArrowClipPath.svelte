<svelte:options namespace="svg" />

<script module lang="ts">
	import type { Box } from '@svelte-draw/editor'

	export interface ArrowClipPathProps {
		radius: number
		hasText: boolean
		bounds: Box
		labelBounds: Box
		as: string
		ae: string
	}
</script>

<script lang="ts">
	import { PathBuilder } from '../shared/PathBuilder'

	let { radius, hasText, bounds, labelBounds, as, ae }: ArrowClipPathProps = $props()

	const d = $derived.by(() => {
		// The direction in which we create the different path parts is important, as it determines what gets clipped.
		// See the description on the directions in the non-zero fill rule example:
		// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule#nonzero
		const path = new PathBuilder()

		// We create this one in the clockwise direction
		path
			.moveTo(bounds.left - 100, bounds.top - 100)
			.lineTo(bounds.right + 100, bounds.top - 100)
			.lineTo(bounds.right + 100, bounds.bottom + 100)
			.lineTo(bounds.left - 100, bounds.bottom + 100)
			.close()

		if (hasText) {
			// We create this one in the counter-clockwise direction, which cuts out the label box
			path
				.moveTo(labelBounds.left, labelBounds.top + radius)
				.lineTo(labelBounds.left, labelBounds.bottom - radius)
				.circularArcTo(radius, false, false, labelBounds.left + radius, labelBounds.bottom)
				.lineTo(labelBounds.right - radius, labelBounds.bottom)
				.circularArcTo(radius, false, false, labelBounds.right, labelBounds.bottom - radius)
				.lineTo(labelBounds.right, labelBounds.top + radius)
				.circularArcTo(radius, false, false, labelBounds.right - radius, labelBounds.top)
				.lineTo(labelBounds.left + radius, labelBounds.top)
				.circularArcTo(radius, false, false, labelBounds.left, labelBounds.top + radius)
				.close()
		}

		return path.toD()
	})
</script>

<!-- We also append the arrowhead paths to the clip path, so that we also clip the arrowheads -->
<path d="{d}{as}{ae}" />
