<script lang="ts">
	import AssetUrlsProvider from '../../../context/AssetUrlsProvider.svelte'
	import { defaultUiAssetUrls } from '../../../assetUrls'
	import SvelteDrawUiTranslationProvider from '../SvelteDrawUiTranslationProvider.svelte'
	import Probe from './Probe.svelte'

	// AssetUrlsProvider > [outerLocale provider >] SvelteDrawUiTranslationProvider > Probe
	let {
		locale,
		overrides,
		outerLocale,
		run,
	}: {
		locale: string
		overrides?: Record<string, Record<string, string>>
		outerLocale?: string
		run: () => void
	} = $props()
</script>

<AssetUrlsProvider assetUrls={defaultUiAssetUrls}>
	{#if outerLocale}
		<SvelteDrawUiTranslationProvider locale={outerLocale} overrides={overrides}>
			<SvelteDrawUiTranslationProvider {locale} {overrides}>
				<Probe {run} />
			</SvelteDrawUiTranslationProvider>
		</SvelteDrawUiTranslationProvider>
	{:else}
		<SvelteDrawUiTranslationProvider {locale} {overrides}>
			<Probe {run} />
		</SvelteDrawUiTranslationProvider>
	{/if}
</AssetUrlsProvider>
