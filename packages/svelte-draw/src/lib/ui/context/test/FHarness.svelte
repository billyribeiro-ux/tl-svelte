<script lang="ts">
	import { defaultUiAssetUrls } from '../../assetUrls'
	import SvelteDrawUiTranslationProvider from '../../hooks/useTranslation/SvelteDrawUiTranslationProvider.svelte'
	import AssetUrlsProvider from '../AssetUrlsProvider.svelte'
	import F from '../F.svelte'
	import type { TLUiMessageProps } from '../i18n'

	let {
		fProps,
		overrides,
		locale = 'en',
		variant = 'plain',
	}: {
		fProps: TLUiMessageProps
		overrides?: Record<string, Record<string, string>>
		locale?: string
		variant?: 'plain' | 'tag' | 'element'
	} = $props()
</script>

{#snippet name(chunks: string)}<strong data-testid="who">{chunks}</strong>{/snippet}
{#snippet help()}<a data-testid="help" href="/help">Get help</a>{/snippet}

<AssetUrlsProvider assetUrls={defaultUiAssetUrls}>
	<SvelteDrawUiTranslationProvider {locale} {overrides}>
		{#if variant === 'tag'}
			<F {...fProps} tags={{ name }} />
		{:else if variant === 'element'}
			<F {...fProps} elements={{ help }} />
		{:else}
			<F {...fProps} />
		{/if}
	</SvelteDrawUiTranslationProvider>
</AssetUrlsProvider>
