<script lang="ts">
	import {
		ContextMenu,
		DEFAULT_SUPPORTED_IMAGE_TYPES,
		DEFAULT_SUPPORT_VIDEO_TYPES,
		DefaultContextMenuContent,
		getEditor,
		getToasts,
		getTranslation,
		registerDefaultExternalContentHandlers,
		registerDefaultSideEffects,
	} from 'svelte-draw'

	const editor = getEditor()
	const toasts = getToasts()
	const msg = getTranslation()

	// [2]
	$effect(() => {
		registerDefaultExternalContentHandlers(editor, {
			maxImageDimension: 5000,
			maxAssetSize: 10 * 1024 * 1024, // 10mb
			acceptedImageMimeTypes: DEFAULT_SUPPORTED_IMAGE_TYPES,
			acceptedVideoMimeTypes: DEFAULT_SUPPORT_VIDEO_TYPES,
			toasts,
			msg,
		})

		const cleanupSideEffects = registerDefaultSideEffects(editor)

		return () => {
			cleanupSideEffects()
		}
	})
</script>

<ContextMenu>
	<DefaultContextMenuContent />
</ContextMenu>
