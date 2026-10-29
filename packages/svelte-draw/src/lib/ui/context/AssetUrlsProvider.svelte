<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { TLUiAssetUrls } from '../assetUrls'
	import { preloadAssetUrls, setAssetUrls } from './asset-urls'

	let { assetUrls, children }: { assetUrls: TLUiAssetUrls; children: Snippet } = $props()

	setAssetUrls({
		get current() {
			return assetUrls
		},
	})

	$effect(() => {
		preloadAssetUrls(assetUrls)
	})
</script>

{@render children()}
