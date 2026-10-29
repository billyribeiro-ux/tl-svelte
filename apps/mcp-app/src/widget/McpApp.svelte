<script lang="ts">
	import { App, PostMessageTransport } from '@modelcontextprotocol/ext-apps'
	import { onMount } from 'svelte'
	import {
		MCP_SERVER_DESCRIPTION,
		MCP_SERVER_NAME,
		MCP_SERVER_TITLE,
		MCP_SERVER_VERSION,
		MCP_SERVER_WEBSITE_URL,
	} from '../shared/types'
	import SvelteDrawCanvas from './SvelteDrawCanvas.svelte'

	// Replaces `useApp` from `@modelcontextprotocol/ext-apps/react`: create the app and connect it
	// over postMessage to the host that embeds this iframe.
	let app = $state.raw<App | null>(null)
	let isConnected = $state(false)
	let error = $state.raw<Error | null>(null)

	onMount(() => {
		let alive = true

		async function connect() {
			try {
				const transport = new PostMessageTransport(window.parent, window.parent)
				const nextApp = new App(
					{
						name: MCP_SERVER_NAME,
						version: MCP_SERVER_VERSION,
						title: MCP_SERVER_TITLE,
						description: MCP_SERVER_DESCRIPTION,
						websiteUrl: MCP_SERVER_WEBSITE_URL,
					},
					{
						availableDisplayModes: ['fullscreen', 'inline'],
					}
				)
				await nextApp.connect(transport)
				if (alive) {
					app = nextApp
					isConnected = true
					error = null
				}
			} catch (err) {
				if (alive) {
					app = null
					isConnected = false
					error = err instanceof Error ? err : new Error('Failed to connect')
				}
			}
		}

		void connect()

		return () => {
			alive = false
		}
	})

	const status = $derived(isConnected ? 'ready' : 'connecting')
</script>

<div>
	{#if error}
		<div class="mcp-app__status mcp-app__status--error">Error: {error.message}</div>
	{:else if !isConnected || !app}
		<div class="mcp-app__status mcp-app__status--connecting">Status: {status}</div>
	{:else}
		<SvelteDrawCanvas {app} />
	{/if}
</div>
