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
	import '#lib/index.css'
	import '#lib/shader.css'
	import type { Snippet } from 'svelte'

	let { children }: { children: Snippet } = $props()
</script>

{@render children()}
