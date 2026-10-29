<script lang="ts" module>
	import { getAssetUrlsByMetaUrl } from '@svelte-draw/assets/urls'
	import { setDefaultEditorAssetUrls, setDefaultUiAssetUrls } from 'svelte-draw'

	// Register the bundled icons/fonts/translations once, before the first editor renders.
	// Without this the SDK falls back to a CDN base URL that does not resolve.
	const assetUrls = getAssetUrlsByMetaUrl()
	setDefaultEditorAssetUrls(assetUrls)
	setDefaultUiAssetUrls(assetUrls)
</script>

<script lang="ts">
	import type { Snippet } from 'svelte'
	import '../app.css'

	let { children }: { children: Snippet } = $props()
</script>

<svelte:head>
	<title>svelte-draw workflow builder</title>
</svelte:head>

{@render children()}
