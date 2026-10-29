<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getAssetUrlsHolder } from '../../context/asset-urls'
	import { setCurrentTranslation, TranslationState } from './useTranslation.svelte'

	/**
	 * Provides a translation context to the editor. Wrap this around components that use
	 * `getTranslation` when you don't want to use the full `SvelteDrawUiContextProvider`. Must be
	 * rendered inside an `AssetUrlsProvider`.
	 *
	 * Unlike the React provider, this does not merge a catalog from an app-level `IntlProvider`
	 * (there is none in Svelte): an app supplies its strings through `overrides`.
	 */
	let {
		overrides,
		locale,
		children,
	}: {
		overrides?: Record<string, Record<string, string>>
		locale: string
		children: Snippet
	} = $props()

	const assetUrls = getAssetUrlsHolder()
	const translationState = new TranslationState(
		() => locale,
		() => overrides,
		() => assetUrls.current
	)
	setCurrentTranslation(translationState)

	$effect(() => translationState.load())
</script>

{@render children()}
