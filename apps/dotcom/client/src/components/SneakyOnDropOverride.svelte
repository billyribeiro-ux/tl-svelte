<script lang="ts">
	import {
		defaultHandleExternalFileContent,
		getDialogs,
		getEditor,
		getToasts,
		getTranslation,
		parseAndLoadDocument,
	} from 'svelte-draw'
	import { isTldrFile, getRejectSvelteDrawOfflineFiles } from '../tla/utils/svelteDrawOfflineFiles.svelte'
	import { shouldOverrideDocument } from '../utils/shouldOverrideDocument'

	let { isMultiplayer }: { isMultiplayer: boolean } = $props()

	const editor = getEditor()
	const toasts = getToasts()
	const dialogs = getDialogs()
	const msg = getTranslation()
	const rejectSvelteDrawOfflineFiles = getRejectSvelteDrawOfflineFiles()

	$effect(() => {
		const multiplayer = isMultiplayer
		editor.registerExternalContentHandler('files', async (content) => {
			const files = rejectSvelteDrawOfflineFiles(content.files)
			const svelteDrawFiles = files.filter(isTldrFile)
			if (svelteDrawFiles.length > 0) {
				if (multiplayer) {
					toasts.addToast({
						title: msg('file-system.shared-document-file-open-error.title'),
						description: msg('file-system.shared-document-file-open-error.description'),
						severity: 'error',
					})
				} else {
					const shouldOverride = await shouldOverrideDocument(dialogs.addDialog)
					if (!shouldOverride) return
					await parseAndLoadDocument(editor, await svelteDrawFiles[0].text(), msg, toasts.addToast)
				}
			} else if (files.length > 0) {
				await defaultHandleExternalFileContent(editor, { ...content, files }, { toasts, msg })
			}
		})
	})
</script>
