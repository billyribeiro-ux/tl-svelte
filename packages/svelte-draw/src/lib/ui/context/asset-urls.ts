import { Image, noop } from '@svelte-draw/editor'
import type { TLUiAssetUrls } from '../assetUrls'
import { defineUiContext } from './uiContext'

/** @public */
export interface AssetUrlsProviderProps {
	assetUrls: TLUiAssetUrls
	children: import('svelte').Snippet
}

const assetUrlsContext = defineUiContext<{ readonly current: TLUiAssetUrls }>(
	'svelte-draw.ui.asset-urls'
)

/**
 * Provides asset URLs through a reactive holder, so a changed `assetUrls` prop reaches readers.
 * Call during component initialisation.
 *
 * @internal
 */
export function setAssetUrls(holder: { readonly current: TLUiAssetUrls }): void {
	assetUrlsContext.set(holder)
}

/**
 * Replaces `useAssetUrls`. Returns the current asset URLs (read at call time; call it again, or
 * use `getAssetUrlsHolder`, to follow a changing prop). Throws outside an `AssetUrlsProvider`.
 *
 * @public
 */
export function getAssetUrls(): TLUiAssetUrls {
	return getAssetUrlsHolder().current
}

/** Like {@link getAssetUrls}, but returns the reactive holder. @public */
export function getAssetUrlsHolder(): { readonly current: TLUiAssetUrls } {
	return assetUrlsContext.get('getAssetUrls must be used within an AssetUrlsProvider')
}

/** Returns the holder, or `null` outside a provider. @internal */
export function tryGetAssetUrlsHolder(): { readonly current: TLUiAssetUrls } | null {
	return assetUrlsContext.tryGet()
}

/**
 * Many icon URLs point at the same sprite sheet and differ only by their `#fragment` identifier
 * (e.g. `0_merged.svg#tool-arrow`). The fragment doesn't change the underlying resource, so
 * preload each unique resource once rather than creating hundreds of redundant Image decodes.
 *
 * @internal
 */
export function preloadAssetUrls(assetUrls: TLUiAssetUrls): void {
	const preloaded = new Set<string>()
	for (const src of [...Object.values(assetUrls.icons), ...Object.values(assetUrls.embedIcons)]) {
		if (!src) continue

		const resource = src.split('#')[0]
		if (preloaded.has(resource)) continue
		preloaded.add(resource)

		const image = Image()
		image.crossOrigin = 'anonymous'
		image.src = src
		image.decode().catch(noop)
	}
}
