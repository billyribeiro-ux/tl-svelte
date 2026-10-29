<script lang="ts">
	import { fileOpen } from 'browser-fs-access'
	import { getTranslation, SVELTE_DRAW_FILE_EXTENSION, SvelteDrawUiMenuItem } from 'svelte-draw'
	import { routes } from '../../../routeDefs'
	import { navigate } from '../../../utils/router.svelte'
	import { getMaybeApp } from '../../hooks/useAppState.svelte'
	import { getSvelteDrawAppUiEvents } from '../../utils/app-ui-events'
	import { getCurrentEditor } from '../../utils/getCurrentEditor'
	import {
		getRejectSvelteDrawOfflineFiles,
		SVELTE_DRAW_OFFLINE_FILE_EXTENSION,
	} from '../../utils/svelteDrawOfflineFiles.svelte'
	import { messages } from './messages'

	const msg = getTranslation()
	const trackEvent = getSvelteDrawAppUiEvents()
	const app = getMaybeApp()
	const rejectSvelteDrawOfflineFiles = getRejectSvelteDrawOfflineFiles()
</script>

<SvelteDrawUiMenuItem
	id="import-file"
	label={msg(messages.importFile)}
	readonlyOk
	onSelect={async () => {
		const editor = getCurrentEditor()
		if (!editor) return
		const currentApp = app.current
		if (!currentApp) return

		trackEvent('import-tldr-file', { source: 'file-menu' })

		try {
			// svelte-draw offline files are selectable so that we can explain why we can't open them
			// yet. Leaving them out of the picker would just grey them out with no explanation.
			const pickedFiles = await fileOpen({
				extensions: [SVELTE_DRAW_FILE_EXTENSION, SVELTE_DRAW_OFFLINE_FILE_EXTENSION],
				multiple: true,
				description: 'svelte-draw project',
			})

			const svelteDrawFiles = rejectSvelteDrawOfflineFiles(pickedFiles)
			if (!svelteDrawFiles.length) return

			currentApp.uploadTldrFiles(svelteDrawFiles, {
				source: 'file-menu',
				onFirstFileUploaded: (fileId) => {
					navigate(routes.tlaFile(fileId), { state: { mode: 'create' } })
				},
			})
		} catch {
			// user cancelled
			return
		}
	}}
/>
