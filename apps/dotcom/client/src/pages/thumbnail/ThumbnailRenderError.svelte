<script lang="ts">
	import { setThumbnailError } from '../thumbnail-render'

	let { message }: { message: string } = $props()

	$effect(() => {
		setThumbnailError(message)
		return () => {
			delete document.body.dataset.thumbnailError
			delete document.documentElement.dataset.thumbnailError
		}
	})
</script>

<div style="padding: 16px; font-family: sans-serif;">{message}</div>
