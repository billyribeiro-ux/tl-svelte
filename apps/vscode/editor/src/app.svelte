<script lang="ts" module>
	import { getAssetUrlsByImport } from '@svelte-draw/assets/imports'
	import { hardReset, setRuntimeOverrides } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import '../public/index.css'
	import { vscode } from './utils/vscode'

	setRuntimeOverrides({
		openWindow: (url, target) => {
			if (url.includes('utm_campaign=watermark')) {
				url = url.replace('utm_source=sdk', 'utm_source=extension')
			}
			vscode.postMessage({
				type: 'vscode:open-window',
				data: {
					url,
					target,
				},
			})
		},
		refreshPage: () => {
			vscode.postMessage({
				type: 'vscode:refresh-page',
			})
		},
		hardReset: async () => {
			await hardReset({ shouldReload: false })
			vscode.postMessage({
				type: 'vscode:hard-reset',
			})
		},
	})

	const handleError = (error: any) => {
		console.error(error.message)
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte'
	import { Spinner, SvelteDraw, type Editor, type TLComponents } from 'svelte-draw'
	import type { VscodeMessage } from '../../messages'
	import ChangeResponder from './ChangeResponder.svelte'
	import FileOpen from './FileOpen.svelte'
	import FullPageMessage from './FullPageMessage.svelte'
	import MainMenu from './MainMenu.svelte'
	import { onCreateAssetFromUrl } from './utils/bookmarks'
	import { registerExternalUrlContentHandler } from './utils/externalUrlContentHandler'

	interface SvelteDrawInnerProps {
		assetSrc: string
		fileContents: string
		uri: string
		isDarkMode: boolean
	}

	let inner = $state.raw<SvelteDrawInnerProps | null>(null)

	onMount(() => {
		function handleMessage({ data: message }: MessageEvent<VscodeMessage>) {
			switch (message.type) {
				case 'vscode:opened-file': {
					inner = {
						assetSrc: message.data.assetSrc,
						fileContents: message.data.fileContents,
						uri: message.data.uri,
						isDarkMode: message.data.isDarkMode,
					}
					// We only want to listen for this message once
					window.removeEventListener('message', handleMessage)
					break
				}
			}
		}

		window.addEventListener('message', handleMessage)

		vscode.postMessage({ type: 'vscode:ready-to-receive-file' })

		return () => {
			window.removeEventListener('message', handleMessage)
		}
	})

	const components: TLComponents = {
		MainMenu,
	}

	const assetUrls = $derived(inner ? getAssetUrlsByImport({ baseUrl: inner.assetSrc }) : undefined)

	function handleMount(editor: Editor) {
		editor.registerExternalAssetHandler('url', onCreateAssetFromUrl)
		registerExternalUrlContentHandler(editor)
	}

	const licenseKey =
		'tldraw-tldraw-2027-05-22/WyJDOEVmdnNlQyIsWyJ2c2NvZGUtd2VidmlldzpcXC9cXC8uKnRsZHJhdy1vcmdcXC50bGRyYXctdnNjb2RlIl0sNDEsIjIwMjctMDUtMjIiXQ.s/4f2jMqZhK2eAHT0LjZZ48NAcrsZ7UdWMerUzQ6q8SZtpkMmuv3JoPviFo+xkfNxD4eaGTGWgHIYyX1VCbwXg'
</script>

<div class="svelte-draw--editor">
	<svelte:boundary onerror={handleError}>
		{#if inner === null}
			<FullPageMessage>
				<Spinner />
			</FullPageMessage>
		{:else}
			<SvelteDraw
				{assetUrls}
				persistenceKey={inner.uri}
				onMount={handleMount}
				{components}
				{licenseKey}
			>
				<!-- <DarkModeHandler themeKind={themeKind} /> -->

				<FileOpen fileContents={inner.fileContents} forceDarkMode={inner.isDarkMode} />
				<ChangeResponder />
			</SvelteDraw>
		{/if}
		{#snippet failed()}
			<FullPageMessage>Fallback</FullPageMessage>
		{/snippet}
	</svelte:boundary>
</div>
