<script lang="ts" module>
	import { getAssetUrlsByMetaUrl } from '@svelte-draw/assets/urls'
	import { setDefaultEditorAssetUrls, setDefaultUiAssetUrls } from 'svelte-draw'

	// Window globals the end-to-end specs read. The React bundle initialised them when it imported
	// the end-to-end page eagerly, so they exist on every route, once per page load.
	const e2eWindow = window as unknown as {
		__svelteDraw_ui_event: unknown
		__svelteDraw_editor_events: unknown[]
	}
	e2eWindow.__svelteDraw_ui_event = { id: 'NOTHING_YET' }
	e2eWindow.__svelteDraw_editor_events = []

	// we use secret internal `setDefaultAssetUrls` functions to set these at the
	// top-level so assets don't need to be passed down in every single example.
	const assetUrls = getAssetUrlsByMetaUrl()
	setDefaultEditorAssetUrls(assetUrls)
	setDefaultUiAssetUrls(assetUrls)
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'
	import { DefaultErrorFallback, ErrorBoundary } from 'svelte-draw'
	import '../styles.css'

	let { children }: { children: Snippet } = $props()
</script>

<svelte:head>
	<title>svelte-draw examples</title>
	<meta
		name="keywords"
		content="svelte-draw, examples, whiteboard, svelte, collaborative whiteboard, online drawing, team collboration, svelte, library"
	/>
	<meta
		name="description"
		content="Examples for using svelte-draw - a library for building infinite canvases with Svelte. "
	/>
</svelte:head>

<ErrorBoundary fallback={DefaultErrorFallback} onError={(error) => console.error(error)}>
	{@render children()}
</ErrorBoundary>
