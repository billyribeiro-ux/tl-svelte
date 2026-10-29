<script lang="ts">
	import { getEditor } from 'svelte-draw'
	import { runThumbnailMeasure } from '../thumbnail-render'

	// Measure mode. The page exists only to be a real editor: it settles, measures, posts, and marks
	// itself ready. The worker's screenshot of it is discarded — driving a Browser Run session is simply
	// how the measurement gets to happen, and the ready marker is how the worker knows it is done.
	let { token }: { token: string } = $props()

	const editor = getEditor()

	$effect(() => runThumbnailMeasure(editor, token))
</script>
