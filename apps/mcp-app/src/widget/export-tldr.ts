import type { App } from '@modelcontextprotocol/ext-apps'
import { Editor, serializeSvelteDrawJson, serializeSvelteDrawJsonBlob } from 'svelte-draw'

export async function exportTldr(editor: Editor, app?: App) {
	const json = await serializeSvelteDrawJson(editor)

	// Copy to clipboard
	navigator.clipboard.writeText(json).catch(() => {
		// Clipboard may be unavailable in some contexts.
	})

	// Download file
	if (app?.getHostCapabilities()?.downloadFile) {
		await app.downloadFile({
			contents: [
				{
					type: 'resource',
					resource: {
						uri: 'file:///diagram.tldr',
						mimeType: 'application/json',
						text: json,
					},
				},
			],
		})
	} else {
		const blob = await serializeSvelteDrawJsonBlob(editor)
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = 'diagram.tldr'
		a.click()
		URL.revokeObjectURL(url)
	}
}
