<script lang="ts" module>
	import {
		registerSvgExportRenderer,
		type SvelteDrawOptions,
		type TLAnyBindingUtilConstructor,
		type TLAnyShapeUtilConstructor,
		type TLAssetStore,
		type TLEditorSnapshot,
		type TLImageExportOptions,
		type TLPageId,
		type TLStoreSnapshot,
		type TLTextOptions,
	} from '@svelte-draw/editor'
	import { svelteSvgExportRenderer } from '@svelte-draw/svelte'
	import type { TLUiAssetUrlOverrides } from './ui/assetUrls'
	import { defaultAddFontsFromNode, tipTapDefaultExtensions } from './utils/text/richText'

	// The Svelte export pipeline (`packages/svelte/src/lib/export`) is what `editor.toImage` renders with.
	registerSvgExportRenderer(svelteSvgExportRenderer)

	/** @public */
	export interface SvelteDrawImageProps extends TLImageExportOptions {
		/**
		 * The snapshot to display.
		 */
		snapshot: Partial<TLEditorSnapshot> | TLStoreSnapshot

		/**
		 * The image format to use. Defaults to 'svg'.
		 */
		format?: 'svg' | 'png'

		/**
		 * The page to display. Defaults to the first page.
		 */
		pageId?: TLPageId

		/**
		 * Additional shape utils to use.
		 */
		shapeUtils?: readonly TLAnyShapeUtilConstructor[]
		/**
		 * Additional binding utils to use.
		 */
		bindingUtils?: readonly TLAnyBindingUtilConstructor[]
		/**
		 * The license key.
		 */
		licenseKey?: string
		/**
		 * Asset URL overrides.
		 */
		assetUrls?: TLUiAssetUrlOverrides
		/**
		 * The asset store to use for resolving the snapshot's assets, matching the `assets` prop on
		 * {@link SvelteDraw}. Without one, assets that aren't stored inline (as data URLs) can't be
		 * resolved and won't appear in the image.
		 */
		assets?: TLAssetStore
		/**
		 * Options for the editor.
		 */
		options?: Partial<SvelteDrawOptions>
		/**
		 * Text options for the editor.
		 *
		 * @deprecated Use `options.text` instead. This prop will be removed in a future release.
		 */
		textOptions?: TLTextOptions
	}

	const defaultOptions: Partial<SvelteDrawOptions> = {
		text: {
			tipTapConfig: {
				extensions: tipTapDefaultExtensions,
			},
			addFontsFromNode: defaultAddFontsFromNode,
		},
	}
</script>

<script lang="ts">
	import { Editor, mergeArraysAndReplaceDefaults } from '@svelte-draw/editor'
	import { createManagedTLStore, shallowArrayIdentity } from '@svelte-draw/svelte'
	import { defaultBindingUtils } from './defaultBindingUtils'
	import { defaultShapeUtils } from './defaultShapeUtils'
	import { defaultEditorAssetUrls } from './utils/static-assets/assetUrls'

	/**
	 * A rendered SVG image of a SvelteDraw snapshot.
	 *
	 * @example
	 * ```svelte
	 * <SvelteDrawImage
	 * 	{snapshot}
	 * 	{pageId}
	 * 	background={false}
	 * 	darkMode={true}
	 * 	bounds={new Box(0, 0, 600, 400)}
	 * 	scale={1}
	 * />
	 * ```
	 *
	 * @public
	 */
	const props: SvelteDrawImageProps = $props()

	let url = $state<string | null>(null)
	let container = $state<HTMLDivElement | null>(null)

	const _shapeUtils = shallowArrayIdentity(() => props.shapeUtils ?? [])
	const shapeUtilsWithDefaults = $derived(
		mergeArraysAndReplaceDefaults('type', _shapeUtils.current, defaultShapeUtils)
	)
	const _bindingUtils = shallowArrayIdentity(() => props.bindingUtils ?? [])
	const bindingUtilsWithDefaults = $derived(
		mergeArraysAndReplaceDefaults('type', _bindingUtils.current, defaultBindingUtils)
	)
	const store = createManagedTLStore(() => ({
		snapshot: props.snapshot,
		shapeUtils: shapeUtilsWithDefaults,
		assets: props.assets,
	}))

	const options = $derived({
		...defaultOptions,
		...props.options,
		text: {
			...defaultOptions.text,
			...(props.options?.text ?? props.textOptions),
		},
	})
	const assetUrlsWithOverrides = $derived(
		props.assetUrls
			? { fonts: { ...defaultEditorAssetUrls.fonts, ...props.assetUrls.fonts } }
			: defaultEditorAssetUrls
	)

	$effect(() => {
		const parent = container
		const currentStore = store.current
		if (!parent) return
		if (!currentStore) return

		// Everything the image depends on is read here, so a change to any of it renders again.
		const {
			format = 'svg',
			pageId,
			bounds,
			scale,
			background,
			padding,
			darkMode,
			preserveAspectRatio,
			licenseKey,
			pixelRatio: _pixelRatio,
		} = props
		const shapeUtils = shapeUtilsWithDefaults
		const bindingUtils = bindingUtilsWithDefaults
		const editorOptions = options
		const fontAssetUrls = assetUrlsWithOverrides.fonts

		let isCancelled = false

		const tempElm = parent.ownerDocument.createElement('div')
		parent.appendChild(tempElm)
		parent.classList.add('tl-container', 'tl-theme__light')

		const editor = new Editor({
			store: currentStore,
			shapeUtils,
			bindingUtils,
			tools: [],
			getContainer: () => tempElm,
			licenseKey,
			fontAssetUrls,
			options: editorOptions,
		})

		if (pageId) editor.setCurrentPage(pageId)

		const shapeIds = editor.getCurrentPageShapeIds()

		async function setSvg() {
			// toImage waits for the required fonts to load (so text is measured correctly) before
			// it renders, so we don't need to do it here.
			const imageResult = await editor.toImage([...shapeIds], {
				bounds,
				scale,
				background,
				padding,
				darkMode,
				preserveAspectRatio,
				format,
			})
			if (!imageResult || isCancelled) return

			url = URL.createObjectURL(imageResult.blob)

			editor.dispose()
		}

		setSvg()

		return () => {
			isCancelled = true
		}
	})

	$effect(() => {
		const objectUrl = url
		return () => {
			if (objectUrl) URL.revokeObjectURL(objectUrl)
		}
	})
</script>

<div bind:this={container} style="position: relative; width: 100%; height: 100%;">
	{#if url}
		<img
			src={url}
			alt=""
			referrerpolicy="strict-origin-when-cross-origin"
			style="width: 100%; height: 100%;"
		/>
	{/if}
</div>
