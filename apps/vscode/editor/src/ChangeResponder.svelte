<script lang="ts">
	import {
		debounce,
		getEditor,
		getToasts,
		getTranslation,
		parseAndLoadDocument,
		serializeSvelteDrawJson,
	} from 'svelte-draw'
	import type { VscodeMessage } from '../../messages'
	import '../public/index.css'
	import { vscode } from './utils/vscode'

	const editor = getEditor()
	const { addToast, clearToasts } = getToasts()
	const msg = getTranslation()

	$effect(() => {
		// When a message is received from the VS Code extension, handle it
		function handleMessage({ data: message }: MessageEvent<VscodeMessage>) {
			switch (message.type) {
				// case 'vscode:undo': {
				// 	editor.undo()
				// 	break
				// }
				// case 'vscode:redo': {
				// 	editor.redo()
				// 	break
				// }
				case 'vscode:revert': {
					parseAndLoadDocument(editor, message.data.fileContents, msg, addToast)
					break
				}
			}
		}

		window.addEventListener('message', handleMessage)

		return () => {
			clearToasts()
			window.removeEventListener('message', handleMessage)
		}
	})

	$effect(() => {
		// When the history changes, send the new file contents to VSCode
		const handleChange = debounce(async () => {
			vscode.postMessage({
				type: 'vscode:editor-updated',
				data: {
					fileContents: await serializeSvelteDrawJson(editor),
				},
			})
		}, 250)

		vscode.postMessage({
			type: 'vscode:editor-loaded',
		})

		const dispose = editor.store.listen(handleChange, { scope: 'document' })

		return () => {
			handleChange()
			dispose()
		}
	})
</script>
