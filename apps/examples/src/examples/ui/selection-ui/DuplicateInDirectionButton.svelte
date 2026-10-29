<script lang="ts">
	import { getEditor, intersectLineSegmentPolygon, Vec } from 'svelte-draw'

	// [3]
	let { x, y, rotation }: { x: number; y: number; rotation: number } = $props()

	const editor = getEditor()

	function duplicate() {
		const selectionRotation = editor.getSelectionRotation() ?? 0
		const rotatedPageBounds = editor.getSelectionRotatedPageBounds()
		if (!rotatedPageBounds) return

		editor.markHistoryStoppingPoint('duplicate in direction')

		const PADDING = 32

		// [4]
		const center = Vec.Rot(rotatedPageBounds.center, selectionRotation)
		const int = intersectLineSegmentPolygon(
			center,
			Vec.Add(center, new Vec(100000, 0).rot(selectionRotation + rotation)),
			rotatedPageBounds
				.clone()
				.expandBy(PADDING)
				.corners.map((c) => c.rot(selectionRotation))
		)
		if (!int?.[0]) return

		const delta = Vec.Sub(int[0], center)
		const offset = delta.uni().mul(delta.len() * 2)

		editor.duplicateShapes(editor.getSelectedShapes(), offset)
	}
</script>

<button
	style:position="absolute"
	style:width="32px"
	style:height="32px"
	style:transform="translate({x}px, {y}px) rotate({rotation}rad)"
	onclick={duplicate}
>
	→
</button>
