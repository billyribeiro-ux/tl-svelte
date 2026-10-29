<!-- Intercepts image drop/paste and shows a "coming soon" toast. -->
<script lang="ts">
	import { getEditor, getToasts } from 'svelte-draw'
	import { extractImageFiles } from './image-guard'

	const editor = getEditor()
	const { addToast } = getToasts()

	$effect(() => {
		const container = editor.getContainer()

		const showBlockedToast = (type: string) => {
			addToast({
				id: `blocked-${type}`,
				title: 'Coming soon!',
				description: `${type} are not yet supported in the svelte-draw MCP app.`,
				severity: 'info',
			})
		}

		const onDrop = (e: DragEvent) => {
			const imageFiles = extractImageFiles(e.dataTransfer)
			if (imageFiles.length > 0) {
				e.preventDefault()
				e.stopPropagation()
				showBlockedToast('Images')
			}
		}

		const onPaste = (e: ClipboardEvent) => {
			const imageFiles = extractImageFiles(e.clipboardData)
			if (imageFiles.length > 0) {
				e.preventDefault()
				e.stopPropagation()
				showBlockedToast('Images')
			}
		}

		container.addEventListener('drop', onDrop, { capture: true })
		document.addEventListener('paste', onPaste, { capture: true })

		// Override external content handlers to block images, embeds, and URLs.
		// The context menu paste uses navigator.clipboard.read() directly,
		// bypassing DOM paste events, so we need to intercept at this level too.
		editor.registerExternalContentHandler('files', async ({ files }) => {
			const hasImages = files.some((f) => f.type.startsWith('image/'))
			if (hasImages) {
				showBlockedToast('Images')
			}
		})
		editor.registerExternalContentHandler('embed', async () => {
			showBlockedToast('Embeds')
		})
		editor.registerExternalContentHandler('url', async () => {
			showBlockedToast('Links')
		})

		return () => {
			container.removeEventListener('drop', onDrop, { capture: true })
			document.removeEventListener('paste', onPaste, { capture: true })
		}
	})
</script>
