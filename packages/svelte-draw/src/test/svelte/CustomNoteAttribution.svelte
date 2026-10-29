<script lang="ts">
	/** A custom `AttributionComponent` for the note shape. Tests only. */
	import type { TLNoteShapeAttributionProps } from '../../lib/shapes/note/DefaultNoteShapeAttribution.svelte'

	let { firstName }: TLNoteShapeAttributionProps = $props()
</script>

<div data-testid="custom-attribution" data-attribution="custom">custom: {firstName}</div>
