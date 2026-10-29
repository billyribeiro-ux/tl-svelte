import { SVELTE_DRAW_FILE_EXTENSION, getDialogs } from 'svelte-draw'
import TlaSvelteDrawOfflineFileDialog from '../components/dialogs/TlaSvelteDrawOfflineFileDialog.svelte'

/**
 * The extension used by svelte-draw offline. Unlike a `.tldr` file, which is JSON, a `.svelte-draw` file is
 * an archive containing a SQLite database and its assets, so none of our `.tldr` handling can read
 * one.
 */
export const SVELTE_DRAW_OFFLINE_FILE_EXTENSION = '.svelte-draw'

export function isTldrFile(file: File) {
	return file.name.toLowerCase().endsWith(SVELTE_DRAW_FILE_EXTENSION)
}

/**
 * Returns a function (was `useRejectSvelteDrawOfflineFiles`) that drops any svelte-draw offline files from a list and tells the user why,
 * handing back the files we can actually handle. Filtering them out here keeps them away from the
 * default file handling, which would otherwise stack a generic "file type not allowed" toast on
 * top of the dialog.
 */
export function getRejectSvelteDrawOfflineFiles() {
	const { addDialog } = getDialogs()

	return (files: File[]) => {
		// Case-insensitive: file dialogs on macOS and Windows match their filters that way, so a
		// `.SVELTE_DRAW` file is selectable and has to be caught here too.
		const supported = files.filter(
			(file) => !file.name.toLowerCase().endsWith(SVELTE_DRAW_OFFLINE_FILE_EXTENSION)
		)
		if (supported.length < files.length) {
			addDialog({
				id: 'svelte-draw-offline-file-unsupported',
				component: TlaSvelteDrawOfflineFileDialog,
			})
		}
		return supported
	}
}
