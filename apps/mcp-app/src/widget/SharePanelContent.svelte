<script lang="ts">
	import { fromComputed, getEditor, SvelteDrawUiIcon } from 'svelte-draw'
	import { isHostCodeEditor } from '../shared/utils'
	import { getMcpAppContext } from './app-context'
	import { exportTldr } from './export-tldr'

	const editor = getEditor()
	const hasShapes = fromComputed('hasShapes', () => editor.getCurrentPageShapeIds().size > 0)

	const ctx = getMcpAppContext()

	const isCodeEditor = $derived(ctx.hostName ? isHostCodeEditor(ctx.hostName) : false)

	function handleBuildItClick() {
		const app = ctx.app
		if (!app) return
		const messageText =
			ctx.lastEditor === 'user'
				? "Hey I've made some edits to the canvas. The new canvas state is attached. Take the changes and implement them in the codebase."
				: 'Use the attached canvas state to implement this in the codebase.'
		app.sendMessage({
			role: 'user',
			content: [
				{
					type: 'text',
					text: messageText,
				},
			],
		})
	}
</script>

<div class="tlui-share-zone mcp-app__share-zone" draggable={false}>
	{#if ctx.canDownload}
		<button
			class="tlui-button tlui-button__low"
			onclick={() => exportTldr(editor, ctx.app ?? undefined)}
			title="Copy to clipboard and download .tldr file"
		>
			<SvelteDrawUiIcon label="Download .tldr file" icon="download" />
		</button>
	{/if}
	{#if ctx.toggleFullscreen && ctx.canFullscreen}
		<button
			class="tlui-button tlui-button__low"
			onclick={ctx.toggleFullscreen}
			title={ctx.displayMode === 'fullscreen' ? 'Exit fullscreen' : 'Enter fullscreen'}
		>
			{ctx.displayMode === 'fullscreen' ? 'Exit fullscreen' : 'Fullscreen'}
		</button>
	{/if}
	{#if ctx.isDev && ctx.toggleDevLog}
		<button
			class="tlui-button tlui-button__low"
			onclick={ctx.toggleDevLog}
			title={ctx.isDevLogVisible ? 'Hide dev log' : 'Show dev log'}
		>
			{ctx.isDevLogVisible ? 'Hide dev log' : 'Show dev log'}
		</button>
	{/if}
	{#if isCodeEditor && ctx.app}
		<button
			onclick={handleBuildItClick}
			disabled={!hasShapes.current}
			title="Build it"
			class="mcp-app__build-button{hasShapes.current ? ' mcp-app__build-button--enabled' : ''}"
		>
			Build it
		</button>
	{/if}
</div>
