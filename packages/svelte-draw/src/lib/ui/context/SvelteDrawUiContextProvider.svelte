<script lang="ts" module>
	import type { RecursivePartial } from '@svelte-draw/editor'
	import type { Snippet } from 'svelte'
	import type { TLUiAssetUrls } from '../assetUrls'
	import type { TLUiOverrides } from '../overrides.svelte'
	import type { TLUiComponents } from './components'
	import type { TLUiEventHandler } from './events'

	/** @public */
	export interface TLUiContextProviderProps {
		/**
		 * Urls for where to find fonts and other assets for the UI.
		 */
		assetUrls?: RecursivePartial<TLUiAssetUrls>

		/**
		 * Overrides for the UI.
		 */
		overrides?: TLUiOverrides | TLUiOverrides[]

		/**
		 * Overrides for the UI components.
		 */
		components?: TLUiComponents

		/**
		 * Callback for when an event occurs in the UI.
		 */
		onUiEvent?: TLUiEventHandler

		/**
		 * Whether to always should the mobile breakpoints.
		 */
		forceMobile?: boolean

		/**
		 * The component's children.
		 */
		children?: Snippet

		/**
		 * Supported mime types for media files.
		 */
		mediaMimeTypes?: string[]
	}
</script>

<script lang="ts">
	import { defaultUserPreferences } from '@svelte-draw/editor'
	import { fromComputed, tryGetEditor } from '@svelte-draw/svelte'
	import { resolveUiAssetUrls } from '../assetUrls'
	import SvelteDrawUiTooltipProvider from '../components/primitives/SvelteDrawUiTooltipProvider.svelte'
	import SvelteDrawUiTranslationProvider from '../hooks/useTranslation/SvelteDrawUiTranslationProvider.svelte'
	import { createMergedTranslationOverrides, setMimeTypes } from '../overrides.svelte'
	import AssetUrlsProvider from './AssetUrlsProvider.svelte'
	import BreakPointProvider from './BreakPointProvider.svelte'
	import InternalProviders from './InternalProviders.svelte'
	import SupplyEditorI18n from './SupplyEditorI18n.svelte'
	import SvelteDrawUiA11yProvider from './SvelteDrawUiA11yProvider.svelte'
	import SvelteDrawUiComponentsProvider from './SvelteDrawUiComponentsProvider.svelte'
	import SvelteDrawUiDialogsProvider from './SvelteDrawUiDialogsProvider.svelte'
	import SvelteDrawUiEventsProvider from './SvelteDrawUiEventsProvider.svelte'
	import SvelteDrawUiToastsProvider from './SvelteDrawUiToastsProvider.svelte'

	let {
		overrides,
		components,
		assetUrls,
		onUiEvent,
		forceMobile,
		mediaMimeTypes,
		children,
	}: TLUiContextProviderProps = $props()

	// To allow mounting the sidebar without an editor running, we use a 'maybe' editor here
	// The sidebar makes use of toasts and dialogs etc, which typically require an editor to be present
	// but we are overriding the providers to allow them to be used without an editor.
	const editor = tryGetEditor()

	setMimeTypes({
		get current() {
			return mediaMimeTypes
		},
	})

	const resolvedAssetUrls = $derived(resolveUiAssetUrls(assetUrls))
	const translationOverrides = createMergedTranslationOverrides(() => overrides)
	// The locale is a user preference signal, so it has to go through the signal bridge.
	const locale = fromComputed(
		'ui locale',
		() => editor?.user.getLocale() ?? defaultUserPreferences.locale
	)
</script>

<AssetUrlsProvider assetUrls={resolvedAssetUrls}>
	<SvelteDrawUiTranslationProvider overrides={translationOverrides.current} locale={locale.current}>
		<SupplyEditorI18n />
		<SvelteDrawUiTooltipProvider>
			<SvelteDrawUiEventsProvider onEvent={onUiEvent}>
				<SvelteDrawUiToastsProvider>
					<SvelteDrawUiDialogsProvider context="tla">
						<SvelteDrawUiA11yProvider>
							<BreakPointProvider {forceMobile}>
								<SvelteDrawUiComponentsProvider overrides={components}>
									<InternalProviders {overrides}>
										{@render children?.()}
									</InternalProviders>
								</SvelteDrawUiComponentsProvider>
							</BreakPointProvider>
						</SvelteDrawUiA11yProvider>
					</SvelteDrawUiDialogsProvider>
				</SvelteDrawUiToastsProvider>
			</SvelteDrawUiEventsProvider>
		</SvelteDrawUiTooltipProvider>
	</SvelteDrawUiTranslationProvider>
</AssetUrlsProvider>
