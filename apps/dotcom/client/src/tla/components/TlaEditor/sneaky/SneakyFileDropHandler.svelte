<script lang="ts">
	import { can } from '@svelte-draw/dotcom-shared'
	import {
		defaultHandleExternalFileContent,
		getEditor,
		getToasts,
		getTranslation,
	} from 'svelte-draw'
	import { routes } from '../../../../routeDefs'
	import { navigate } from '../../../../utils/router.svelte'
	import { getMaybeApp } from '../../../hooks/useAppState.svelte'
	import { getCurrentFileId } from '../../../hooks/useCurrentFileId.svelte'
	import {
		getRejectSvelteDrawOfflineFiles,
		isTldrFile,
	} from '../../../utils/svelteDrawOfflineFiles.svelte'

	const editor = getEditor()
	const app = getMaybeApp()
	const toasts = getToasts()
	const msg = getTranslation()
	const currentFileId = getCurrentFileId()
	const rejectSvelteDrawOfflineFiles = getRejectSvelteDrawOfflineFiles()

	$effect(() => {
		const currentApp = app.current
		const fileId = currentFileId.current
		if (!currentApp) return
		editor.registerExternalContentHandler('files', async (content) => {
			const files = rejectSvelteDrawOfflineFiles(content.files)
			const svelteDrawFiles = files.filter(isTldrFile)
			if (svelteDrawFiles.length > 0) {
				// Drop into the open file's workspace only if the user can add files there; a guest on
				// a shared board would otherwise upload the snapshot and then have createFile refused.
				const owningGroupId = fileId ? currentApp.getFile(fileId)?.owningGroupId : null
				const workspaceId =
					owningGroupId && can(currentApp.getWorkspaceMembership(owningGroupId)?.role, 'addFiles')
						? owningGroupId
						: undefined
				await currentApp.uploadTldrFiles(svelteDrawFiles, {
					source: 'file-drop',
					onFirstFileUploaded: (fileId) => {
						navigate(routes.tlaFile(fileId), { state: { mode: 'create' } })
					},
					workspaceId,
				})
			} else if (files.length > 0) {
				await defaultHandleExternalFileContent(editor, { ...content, files }, { toasts, msg })
			}
		})
	})
</script>
