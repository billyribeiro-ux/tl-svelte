<script lang="ts">
	import { setThumbnailError } from '../thumbnail-render'

	// Stands in for the SDK's crash screen inside <SvelteDraw>. Without it a throw during the editor's own
	// render — a snapshot at a schema this bundle cannot migrate, across a client deploy — shows the
	// SDK's fallback with neither marker set, and the capture burns the whole Browser Run timeout
	// instead of failing in milliseconds.
	let { error }: { error: unknown } = $props()

	$effect(() => {
		setThumbnailError(error instanceof Error ? error.message : String(error))
	})
</script>
