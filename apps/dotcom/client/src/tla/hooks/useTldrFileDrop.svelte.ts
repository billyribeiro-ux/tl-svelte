import { tlmenus } from 'svelte-draw'
import { routes } from '../../routeDefs'
import { getAuth } from '../../utils/clerk.svelte'
import { navigate } from '../../utils/router.svelte'
import { tokenOrUndefinedWhenOffline } from '../utils/auth'
import { getRejectSvelteDrawOfflineFiles, isTldrFile } from '../utils/svelteDrawOfflineFiles.svelte'
import { getApp } from './useAppState.svelte'

export function getTldrFileDrop() {
	const app = getApp()
	const auth = getAuth()
	const rejectSvelteDrawOfflineFiles = getRejectSvelteDrawOfflineFiles()

	async function onDrop(e: DragEvent) {
		// Read the file list before any await: the DataTransfer is neutered once the drop event
		// finishes dispatching, so reading it after the token fetch finds it empty.
		const droppedFiles = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : []
		if (!droppedFiles.length) return

		const token = await tokenOrUndefinedWhenOffline(() => auth.current.getToken())
		if (!token) {
			return
		}

		const files = rejectSvelteDrawOfflineFiles(droppedFiles)
		const svelteDrawFiles = files.filter(isTldrFile)
		if (!svelteDrawFiles.length) {
			return
		}
		app.current.uploadTldrFiles(svelteDrawFiles, {
			source: 'file-drop',
			onFirstFileUploaded: (fileId) => {
				navigate(routes.tlaFile(fileId))
			},
		})
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault()
	}

	function onDragEnter() {
		tlmenus.hideOpenMenus()
	}

	function onDragLeave(e: DragEvent) {
		if (e.relatedTarget && (e.currentTarget as Node | null)?.contains(e.relatedTarget as Node)) {
			return
		}
		tlmenus.showOpenMenus()
	}

	return { onDrop, onDragOver, onDragEnter, onDragLeave }
}
