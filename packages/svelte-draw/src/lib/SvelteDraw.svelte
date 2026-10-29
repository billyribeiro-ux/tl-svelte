<script lang="ts" module>
	import {
		type TLEditorComponents,
		type TLOnMountHandler,
		type SvelteDrawEditorBaseProps,
		type SvelteDrawEditorStoreProps,
	} from '@svelte-draw/svelte'
	import { registerSvgExportRenderer, type TLTextOptions } from '@svelte-draw/editor'
	import { svelteSvgExportRenderer } from '@svelte-draw/svelte'
	import type { TLEmbedDefinition } from './defaultEmbedDefinitions'
	import type { TLExternalContentProps } from './defaultExternalContentHandlers'
	import type { TLUiAssetUrlOverrides } from './ui/assetUrls'
	import type { TLUiComponents } from './ui/context/components'
	import type { SvelteDrawUiProps } from './ui/SvelteDrawUi.svelte'

	// The Svelte export pipeline is what `editor.toImage` / `exportAs` / `copyAs` render with.
	registerSvgExportRenderer(svelteSvgExportRenderer)

	/**
	 * Override the default Svelte components used by the editor and UI. Set components to null to
	 * disable them entirely.
	 *
	 * @example
	 * ```ts
	 * // In a component's <script lang="ts"> block:
	 * import { SvelteDraw, type TLComponents } from 'svelte-draw'
	 * import MyScribble from './MyScribble.svelte'
	 *
	 * const components: TLComponents = { Scribble: MyScribble }
	 * // ...then render it: <SvelteDraw {components} />
	 * ```
	 *
	 * @public
	 */
	export interface TLComponents extends TLEditorComponents, TLUiComponents {}

	/** @public */
	export interface SvelteDrawBaseProps
		extends SvelteDrawUiProps, SvelteDrawEditorBaseProps, TLExternalContentProps {
		/** Urls for custom assets. */
		assetUrls?: TLUiAssetUrlOverrides
		/** Overrides for svelte-draw's components. */
		components?: TLComponents
		/**
		 * Custom definitions for svelte-draw's embeds.
		 *
		 * @deprecated Use `EmbedShapeUtil.configure({ embedDefinitions: embeds })` instead.
		 */
		embeds?: TLEmbedDefinition[]
		/**
		 * Text options for the editor.
		 *
		 * @deprecated Use `options.text` instead. This prop will be removed in a future release.
		 */
		textOptions?: TLTextOptions
		/**
		 * The locale to use for the editor's UI. When set, this takes priority over
		 * both the browser's language preferences (`navigator.languages`) and the
		 * user's locale preference (e.g. via
		 * `editor.user.updateUserPreferences({ locale: '...' })`), giving the
		 * application explicit control over the displayed language.
		 *
		 * @example
		 * ```svelte
		 * <SvelteDraw locale="fr" />
		 * ```
		 */
		locale?: string
	}

	/** @public */
	export type SvelteDrawProps = SvelteDrawBaseProps & SvelteDrawEditorStoreProps

	export type { TLOnMountHandler }
</script>

<script lang="ts">
	import {
		DEFAULT_SUPPORT_VIDEO_TYPES,
		DEFAULT_SUPPORTED_IMAGE_TYPES,
		defaultUserPreferences,
		mergeArraysAndReplaceDefaults,
		type TLAnyAssetUtilConstructor,
	} from '@svelte-draw/editor'
	import {
		fromComputed,
		type TLSpinnerProps,
		SvelteDrawEditor,
		shallowArrayIdentity,
		shallowObjectIdentity,
	} from '@svelte-draw/svelte'
	import type { Component } from 'svelte'
	import { ImageAssetUtil } from './assets/ImageAssetUtil'
	import { VideoAssetUtil } from './assets/VideoAssetUtil'
	import { defaultAssetUtils } from './defaultAssetUtils'
	import { defaultBindingUtils } from './defaultBindingUtils'
	import { defaultOverlayUtils } from './defaultOverlayUtils'
	import { defaultShapeTools } from './defaultShapeTools'
	import { defaultShapeUtils } from './defaultShapeUtils'
	import { defaultTools } from './defaultTools'
	import { EmbedShapeUtil } from './shapes/embed/EmbedShapeUtil'
	import { setCustomInFrontOfTheCanvas } from './inFrontOfTheCanvasContext'
	import SvelteDrawCombinedInFrontOfTheCanvas from './SvelteDrawCombinedInFrontOfTheCanvas.svelte'
	import SvelteDrawInsideEditor from './SvelteDrawInsideEditor.svelte'
	import { resolveUiAssetUrls } from './ui/assetUrls'
	import LoadingScreen from './ui/components/LoadingScreen.svelte'
	import Spinner from './ui/components/Spinner.svelte'
	import AssetUrlsProvider from './ui/context/AssetUrlsProvider.svelte'
	import SvelteDrawUiTranslationProvider from './ui/hooks/useTranslation/SvelteDrawUiTranslationProvider.svelte'
	import { createMergedTranslationOverrides } from './ui/overrides.svelte'
	// Importing the UI entry registers the default UI components (see `ui/index.ts`).
	import './ui/index'
	import SvelteDrawUi from './ui/SvelteDrawUi.svelte'
	import SvelteDrawUiInFrontOfTheCanvas from './ui/SvelteDrawUiInFrontOfTheCanvas.svelte'
	import { defaultEditorAssetUrls } from './utils/static-assets/assetUrls'
	import { defaultAddFontsFromNode, tipTapDefaultExtensions } from './utils/text/richText'

	const allDefaultTools = [...defaultTools, ...defaultShapeTools]

	function configureDefaultAssetUtils(
		assetUtils: readonly TLAnyAssetUtilConstructor[],
		overrides: Pick<
			TLExternalContentProps,
			'maxImageDimension' | 'acceptedImageMimeTypes' | 'acceptedVideoMimeTypes'
		>
	): readonly TLAnyAssetUtilConstructor[] {
		const { maxImageDimension, acceptedImageMimeTypes, acceptedVideoMimeTypes } = overrides
		const needsImageConfig = maxImageDimension !== undefined || acceptedImageMimeTypes !== undefined
		const needsVideoConfig = acceptedVideoMimeTypes !== undefined
		if (!needsImageConfig && !needsVideoConfig) return assetUtils

		return assetUtils.map((util) => {
			if (needsImageConfig && util.type === 'image') {
				return (util as typeof ImageAssetUtil).configure({
					...(maxImageDimension !== undefined && { maxDimension: maxImageDimension }),
					...(acceptedImageMimeTypes !== undefined && {
						supportedMimeTypes: acceptedImageMimeTypes,
					}),
				})
			}
			if (needsVideoConfig && util.type === 'video') {
				return (util as typeof VideoAssetUtil).configure({
					...(acceptedVideoMimeTypes !== undefined && {
						supportedMimeTypes: acceptedVideoMimeTypes,
					}),
				})
			}
			return util
		})
	}

	/**
	 * The SDK's top-level component: the editor with svelte-draw's default shapes, tools, bindings,
	 * overlays, assets and UI.
	 *
	 * @public
	 */
	let {
		children,
		maxImageDimension,
		maxAssetSize,
		acceptedImageMimeTypes,
		acceptedVideoMimeTypes,
		onMount,
		components = {},
		shapeUtils = [],
		bindingUtils = [],
		assetUtils = [],
		overlayUtils = [],
		tools = [],
		// needs to be here for backwards compatibility
		embeds,
		options,
		locale,
		// needs to be here for backwards compatibility with SvelteDrawEditor
		textOptions: _textOptions,
		...rest
	}: SvelteDrawProps = $props()

	// The identity helpers keep a value's identity until it changes shallowly, so an inline
	// `components={{ ... }}` or `shapeUtils={[...]}` does not rebuild everything below on every render.
	const _components = shallowObjectIdentity(() => components)

	const CustomInFrontOfTheCanvas = $derived(components?.InFrontOfTheCanvas)
	setCustomInFrontOfTheCanvas({
		get current() {
			return CustomInFrontOfTheCanvas
		},
	})
	const InFrontOfTheCanvas = $derived.by(() => {
		if (rest.hideUi) return CustomInFrontOfTheCanvas ?? null
		if (!CustomInFrontOfTheCanvas) return SvelteDrawUiInFrontOfTheCanvas

		return SvelteDrawCombinedInFrontOfTheCanvas
	})
	const componentsWithDefault = $derived({
		// Spinner also accepts any SVG attribute; the slot only ever passes `class`.
		Spinner: Spinner as Component<TLSpinnerProps>,
		LoadingScreen,
		..._components.current,
		InFrontOfTheCanvas,
	})

	const _shapeUtils = shallowArrayIdentity(() => shapeUtils)
	const shapeUtilsWithDefaults = $derived(
		mergeArraysAndReplaceDefaults('type', _shapeUtils.current, defaultShapeUtils)
	)

	const _bindingUtils = shallowArrayIdentity(() => bindingUtils)
	const bindingUtilsWithDefaults = $derived(
		mergeArraysAndReplaceDefaults('type', _bindingUtils.current, defaultBindingUtils)
	)

	const _assetUtils = shallowArrayIdentity(() => assetUtils)
	const assetUtilsWithDefaults = $derived(
		configureDefaultAssetUtils(
			mergeArraysAndReplaceDefaults('type', _assetUtils.current, defaultAssetUtils),
			{ maxImageDimension, acceptedImageMimeTypes, acceptedVideoMimeTypes }
		)
	)

	const _overlayUtils = shallowArrayIdentity(() => overlayUtils)
	const overlayUtilsWithDefaults = $derived(
		mergeArraysAndReplaceDefaults('type', _overlayUtils.current, defaultOverlayUtils)
	)

	const _tools = shallowArrayIdentity(() => tools)
	const toolsWithDefaults = $derived(
		mergeArraysAndReplaceDefaults('id', _tools.current, allDefaultTools)
	)

	const _imageMimeTypes = shallowArrayIdentity(
		() => acceptedImageMimeTypes ?? DEFAULT_SUPPORTED_IMAGE_TYPES
	)
	const _videoMimeTypes = shallowArrayIdentity(
		() => acceptedVideoMimeTypes ?? DEFAULT_SUPPORT_VIDEO_TYPES
	)

	// Merge deprecated textOptions prop with options.textOptions
	// options.textOptions takes precedence over the deprecated textOptions prop
	const _mergedTextOptions = $derived(options?.text ?? _textOptions)
	const textOptionsWithDefaults = $derived<TLTextOptions>({
		addFontsFromNode: defaultAddFontsFromNode,
		..._mergedTextOptions,
		tipTapConfig: {
			extensions: tipTapDefaultExtensions,
			..._mergedTextOptions?.tipTapConfig,
		},
	})

	const optionsWithDefaults = $derived({
		...options,
		text: textOptionsWithDefaults,
	})

	const mediaMimeTypes = $derived([..._imageMimeTypes.current, ..._videoMimeTypes.current])

	const assets = $derived(
		rest.assetUrls
			? { fonts: { ...defaultEditorAssetUrls.fonts, ...rest.assetUrls.fonts } }
			: defaultEditorAssetUrls
	)

	// The embed definitions have to be in place before the editor creates its shape utils, so this
	// runs as a pre-effect rather than after the first render.
	$effect.pre(() => {
		const embedShapeUtil = shapeUtilsWithDefaults.find((util) => util.type === 'embed')
		if (embedShapeUtil && embeds) {
			EmbedShapeUtil.setEmbedDefinitions(embeds)
		}
	})

	// We provide an extra higher layer of asset+translations providers here so that
	// loading UI (which is rendered outside of SvelteDrawUi) may be translated.
	// Ideally we would refactor to hoist all the UI context providers we can up here. Maybe later.
	const uiAssetUrls = $derived(resolveUiAssetUrls(rest.assetUrls))
	const translationOverrides = createMergedTranslationOverrides(() => rest.overrides)
	// The user's locale preference is a signal, so it has to go through the signal bridge.
	const userLocale = $derived.by(() => {
		const user = rest.user
		return user ? fromComputed('svelte-draw user locale', () => user.userPreferences.get().locale) : null
	})
	// If the locale prop is provided, then use that and assume it to be controlled
	const resolvedLocale = $derived(locale ?? userLocale?.current ?? defaultUserPreferences.locale)
</script>

<AssetUrlsProvider assetUrls={uiAssetUrls}>
	<SvelteDrawUiTranslationProvider
		overrides={translationOverrides.current}
		locale={resolvedLocale}
	>
		<SvelteDrawEditor
			initialState="select"
			{...rest}
			components={componentsWithDefault}
			shapeUtils={shapeUtilsWithDefaults}
			bindingUtils={bindingUtilsWithDefaults}
			assetUtils={assetUtilsWithDefaults}
			overlayUtils={overlayUtilsWithDefaults}
			tools={toolsWithDefaults}
			options={optionsWithDefaults}
			assetUrls={assets}
		>
			<SvelteDrawUi {...rest} components={componentsWithDefault} {mediaMimeTypes}>
				<SvelteDrawInsideEditor
					{maxImageDimension}
					{maxAssetSize}
					acceptedImageMimeTypes={_imageMimeTypes.current}
					acceptedVideoMimeTypes={_videoMimeTypes.current}
					{onMount}
				/>
				{@render children?.()}
			</SvelteDrawUi>
		</SvelteDrawEditor>
	</SvelteDrawUiTranslationProvider>
</AssetUrlsProvider>
