import {
	Editor,
	type SvgExportContext,
	type TLAssetId,
	type TLImageAsset,
	type TLShapeId,
	type TLVideoAsset,
	react,
} from '@svelte-draw/editor'
import { delaySvgExport, getEditor, getSvgExportContext } from '@svelte-draw/svelte'
import { untrack } from 'svelte'

/**
 * Options for {@link useImageOrVideoAsset}.
 *
 * @public
 */
export interface UseImageOrVideoAssetOptions {
	/** The asset ID you want a URL for. */
	assetId: TLAssetId | null
	/**
	 * The shape the asset is being used for. We won't update the resolved URL while the shape is
	 * off-screen.
	 */
	shapeId?: TLShapeId
	/**
	 * The width at which the asset will be displayed, in shape-space pixels.
	 */
	width: number
}

interface ImageOrVideoAssetResult {
	asset: (TLImageAsset | TLVideoAsset) | null
	url: string | null
	isPlaceholder?: boolean
}

/**
 * This is a handy helper that resolves an asset to an optimized URL for a given shape, or its
 * {@link @svelte-draw/editor#Editor.createTemporaryAssetPreview | placeholder} if the asset is still
 * uploading. This is used in particular for high-resolution images when you want lower and higher
 * resolution depending on the size of the image on the canvas and the zoom level.
 *
 * Call it during component initialisation. `getOptions` is a getter so the helper follows prop
 * changes; read `.asset` and `.url` of the result in the template. Replaces the React
 * `useImageOrVideoAsset` hook.
 *
 * For image scaling to work, you need to implement scaled URLs in
 * {@link @svelte-draw/tlschema#TLAssetStore.resolve}.
 *
 * @public
 */
export function useImageOrVideoAsset(getOptions: () => UseImageOrVideoAssetOptions): {
	readonly asset: (TLImageAsset | TLVideoAsset) | null
	readonly url: string | null
	readonly isPlaceholder: boolean
} {
	const editor = getEditor()
	const exportInfo = getSvgExportContext()
	const exportIsReady = delaySvgExport()

	// We use a state to store the result of the asset resolution, and we're going to avoid updating this whenever we can
	let result = $state.raw<ImageOrVideoAssetResult>(
		untrack(() => {
			const { assetId } = getOptions()
			return {
				asset: assetId ? (editor.getAsset<TLImageAsset | TLVideoAsset>(assetId) ?? null) : null,
				url: null as string | null,
			}
		})
	)
	const setResult = (
		next: ImageOrVideoAssetResult | ((prev: ImageOrVideoAssetResult) => ImageOrVideoAssetResult)
	) => {
		// Never read `result` as a dependency of the effect below
		result = typeof next === 'function' ? next(untrack(() => result)) : next
	}

	// A flag for whether we've resolved the asset URL at least once, after which we can debounce
	let didAlreadyResolve = false

	// Track the previous assetId to detect when the asset itself changes
	let previousAssetId: TLAssetId | null = null

	// Track whether we should run immediately (skip debouncing) for the next resolution
	let shouldRunImmediately = false

	// The last url passed to setResult, or undefined once the asset changes or vanishes. resolve()
	// skips a url equal to this one, so a plain null here would swallow a legitimate null result
	// (an asset still uploading) and leave the previous asset on screen
	let previousUrl: string | null | undefined = undefined

	$effect(() => {
		// These are the effect's dependencies (the React deps were [assetId, shapeId, width])
		const { assetId, shapeId, width } = getOptions()

		// Check if the assetId changed (not just resolution/scale updates)
		const assetIdChanged = previousAssetId !== assetId
		previousAssetId = assetId

		if (assetIdChanged) {
			// New asset: skip the debounce and drop the stale url (see previousUrl)
			shouldRunImmediately = true
			previousUrl = undefined
		}

		if (!assetId) {
			// Asset detached: without this the last resolved url keeps rendering
			if (assetIdChanged) setResult({ asset: null, url: null })
			return
		}

		let isCancelled = false
		let cancelDebounceFn: (() => void) | undefined
		// Bumped when the asset record disappears, so a resolution already in flight for the old
		// record cannot put it back on screen
		let generation = 0

		const cleanupEffectScheduler = untrack(() =>
			react('update state', () => {
				if (!exportInfo && shapeId && editor.getCulledShapes().has(shapeId)) return

				// Get the fresh asset
				const asset = editor.getAsset<TLImageAsset | TLVideoAsset>(assetId)
				if (!asset) {
					// Record gone (failed upload, deleted before undo): reset so a record that comes back
					// with the same src resolves like a new asset
					shouldRunImmediately = true
					previousUrl = undefined
					generation++
					cancelDebounceFn?.()
					setResult((prev) =>
						prev.asset === null && prev.url === null ? prev : { asset: null, url: null }
					)
					return
				}

				// Set initial preview for the shape if it has no source (if it was pasted into a local project as base64)
				if (!asset.props.src) {
					const preview = editor.getTemporaryAssetPreview(asset.id)
					if (preview) {
						if (previousUrl !== preview) {
							previousUrl = preview // just for kicks, let's save the url as the previous URL
							setResult((prev) => ({ ...prev, isPlaceholder: true, url: preview })) // set the preview as the URL
							exportIsReady() // let the SVG export know we're ready for export
						}
						return
					}
				}

				// aside ...we could bail here if the only thing that has changed is the shape has changed from culled to not culled

				const screenScale = exportInfo
					? exportInfo.scale * (width / asset.props.w)
					: editor.getEfficientZoomLevel() * (width / asset.props.w)

				const resolveGeneration = generation
				function resolve(asset: TLImageAsset | TLVideoAsset, url: string | null) {
					if (isCancelled) return // don't update if the hook has remounted
					if (resolveGeneration !== generation) return // the record was deleted meanwhile
					if (previousUrl === url) return // don't update the state if the url is the same
					didAlreadyResolve = true // mark that we've resolved our first image
					previousUrl = url // keep the url around to compare with the next one
					setResult({ asset, url })
					exportIsReady() // let the SVG export know we're ready for export
				}

				// Debounce fetching potentially multiple image variations (e.g. during zoom or resize).
				// Don't debounce when the asset itself changes - resolve immediately.
				if (didAlreadyResolve && !shouldRunImmediately) {
					let tick = 0

					const resolveAssetAfterAWhile = () => {
						tick++
						if (tick > 500 / 16) {
							// debounce for 500ms
							resolveAssetUrl(editor, assetId, screenScale, exportInfo, (url) =>
								resolve(asset, url)
							)
							cancelDebounceFn?.()
						}
					}

					cancelDebounceFn?.()
					editor.on('tick', resolveAssetAfterAWhile)
					cancelDebounceFn = () => editor.off('tick', resolveAssetAfterAWhile)
				} else {
					// Resolve immediately when: first resolution, or the asset itself changed.
					// Cancel any pending debounce to prevent stale updates.
					cancelDebounceFn?.()
					resolveAssetUrl(editor, assetId, screenScale, exportInfo, (url) => resolve(asset, url))
					// Reset the flag after immediate resolution so subsequent updates are debounced
					shouldRunImmediately = false
				}
			})
		)

		return () => {
			cleanupEffectScheduler()
			cancelDebounceFn?.()
			isCancelled = true
		}
	})

	return {
		get asset() {
			return result.asset
		},
		get url() {
			return result.url
		},
		get isPlaceholder() {
			return result.isPlaceholder ?? false
		},
	}
}

function resolveAssetUrl(
	editor: Editor,
	assetId: TLAssetId,
	screenScale: number,
	exportInfo: SvgExportContext | null,
	callback: (url: string | null) => void
) {
	editor
		.resolveAssetUrl(assetId, {
			screenScale,
			shouldResolveToOriginal: exportInfo ? exportInfo.pixelRatio === null : false,
			dpr: exportInfo?.pixelRatio ?? undefined,
		})
		// There's a weird bug with out debounce function that doesn't
		// make it work right with async functions, so we use a callback
		// here instead of returning a promise.
		.then((url) => {
			callback(url)
		})
}
