<script lang="ts">
	import { getEditor, getToasts, getTranslation, parseAndLoadDocument } from 'svelte-draw'
	import { untrack } from 'svelte'
	import { vscode } from './utils/vscode'

	let { fileContents, forceDarkMode }: { fileContents: string; forceDarkMode: boolean } = $props()

	const editor = getEditor()
	const { addToast, clearToasts } = getToasts()
	const msg = getTranslation()

	// The file is loaded exactly once, when this component mounts (the React original guarded the
	// effect with an `isFileLoaded` flag). Props are read untracked so later prop changes don't reload it.
	$effect(() => {
		untrack(() => {
			function onV1FileLoad() {
				vscode.postMessage({
					type: 'vscode:v1-file-opened',
					data: {
						description: msg('vscode.file-open.desc'),
						backup: msg('vscode.file-open.backup'),
						backupSaved: msg('vscode.file-open.backup-saved'),
						backupFailed: msg('vscode.file-open.backup-failed'),
						dontAskAgain: msg('vscode.file-open.dont-show-again'),
						open: msg('vscode.file-open.open'),
					},
				})
			}

			async function loadFile() {
				await parseAndLoadDocument(
					editor,
					fileContents,
					msg,
					addToast,
					onV1FileLoad,
					forceDarkMode
				)
			}

			loadFile()
		})
		return () => {
			clearToasts()
		}
	})
</script>
