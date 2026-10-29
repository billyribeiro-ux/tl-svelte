<script lang="ts">
	import type { TLImageShape } from '@svelte-draw/editor'
	import { fromComputed, getEditor, HTMLContainer } from '@svelte-draw/svelte'
	import BrokenAssetIcon from '../shared/BrokenAssetIcon.svelte'
	import { getUncroppedSize } from '../shared/crop'
	import HyperlinkButton from '../shared/HyperlinkButton.svelte'
	import { styleToString } from '../shared/styleToString'
	import { useImageOrVideoAsset } from '../shared/useImageOrVideoAsset.svelte'
	import { usePrefersReducedMotion } from '../shared/usePrefersReducedMotion.svelte'
	import { getAlphaData, preloadAlphaData, TRANSPARENT_IMAGE_MIMETYPES } from './ImageAlphaCache'
	import {
		getCroppedContainerStyle,
		getFirstFrameOfAnimatedImage,
		getFlipStyle,
		getIsAnimated,
	} from './imageHelpers'

	let { shape }: { shape: TLImageShape } = $props()

	const editor = getEditor()

	const assetState = useImageOrVideoAsset(() => ({
		shapeId: shape.id,
		assetId: shape.props.assetId,
		width: getUncroppedSize(shape.props, shape.props.crop).w,
	}))
	const asset = $derived(assetState.asset)
	const url = $derived(assetState.url)

	const prefersReducedMotion = usePrefersReducedMotion()
	let staticFrameSrc = $state('')
	let loadedUrl = $state<null | string>(null)
	const isAnimated = $derived(asset ? getIsAnimated(editor, asset.id) : false)

	$effect(() => {
		const currentUrl = url
		if (currentUrl && isAnimated) {
			const { promise, cancel } = getFirstFrameOfAnimatedImage(currentUrl)

			promise.then(
				(dataUrl) => {
					staticFrameSrc = dataUrl
					loadedUrl = currentUrl
				},
				() => {
					// couldn't decode a first frame; keep showing the animated source
				}
			)

			return () => {
				cancel()
			}
		}
		return undefined
	})

	const mimeType = $derived(asset && 'mimeType' in asset.props ? asset.props.mimeType : null)
	const supportsTransparency = $derived(
		mimeType != null && TRANSPARENT_IMAGE_MIMETYPES.includes(mimeType)
	)
	const assetSrc = $derived(asset && 'src' in asset.props ? asset.props.src : null)

	$effect(() => {
		if (url && supportsTransparency) {
			// Cache under asset.props.src so getGeometry (which only has the asset
			// record) can look up the data even when the resolved URL differs.
			preloadAlphaData(url, assetSrc ?? undefined)
		}
	})

	const showCropPreview = fromComputed(
		'show crop preview',
		() =>
			shape.id === editor.getOnlySelectedShapeId() &&
			editor.getCroppingShapeId() === shape.id &&
			editor.isIn('select.crop')
	)

	// We only want to reduce motion for mimeTypes that have motion
	const reduceMotion = $derived(
		prefersReducedMotion.current && (asset?.props.mimeType?.includes('video') || isAnimated)
	)

	const containerStyle = $derived(styleToString(getCroppedContainerStyle(shape)))
	const flipStyle = $derived(styleToString(getFlipStyle(shape)) || undefined)

	const nextSrc = $derived(url === loadedUrl ? null : url)
	const loadedSrc = $derived(reduceMotion ? staticFrameSrc : loadedUrl)

	// We don't set crossOrigin for non-animated images because for Cloudflare we don't currently
	// have that set up.
	const crossOrigin = $derived(isAnimated ? 'anonymous' : undefined)
</script>

<!-- This logic path is for when it's broken/missing asset. -->
{#if !url && !asset?.props.src}
	<HTMLContainer
		id={shape.id}
		style={styleToString({
			overflow: 'hidden',
			width: shape.props.w,
			height: shape.props.h,
			color: 'var(--tl-color-text-3)',
			backgroundColor: 'var(--tl-color-low)',
			border: '1px solid var(--tl-color-low-border)',
		})}
	>
		<div
			class={['tl-image-container', asset && 'tl-image-container-loading']}
			style={containerStyle}
		>
			{#if !asset}<BrokenAssetIcon />{/if}
		</div>
		{#if 'url' in shape.props && shape.props.url}<HyperlinkButton url={shape.props.url} />{/if}
	</HTMLContainer>
{:else}
	{#if showCropPreview.current && loadedSrc}
		<div style={containerStyle}>
			<img
				class="tl-image"
				style={styleToString({ ...getFlipStyle(shape), opacity: 0.1 })}
				crossorigin={crossOrigin}
				src={loadedSrc}
				referrerpolicy="strict-origin-when-cross-origin"
				draggable={false}
				alt=""
			/>
		</div>
	{/if}
	<HTMLContainer
		id={shape.id}
		style={styleToString({
			overflow: 'hidden',
			width: shape.props.w,
			height: shape.props.h,
			borderRadius: shape.props.crop?.isCircle ? '50%' : undefined,
		})}
	>
		<div class="tl-image-container" style={containerStyle}>
			<!-- We have two images: the currently loaded image, and the next image that
			we're waiting to load. we keep the loaded image mounted while we're waiting
			for the next one by storing the loaded URL in state. We key the images on
			the src so that when the next image is ready, the previous one will
			be unmounted and the next will be shown without the browser having to remount a
			fresh image and decode it again from the cache. -->
			{#if loadedSrc}
				{#key loadedSrc}
					<img
						class="tl-image"
						style={flipStyle}
						crossorigin={crossOrigin}
						src={loadedSrc}
						referrerpolicy="strict-origin-when-cross-origin"
						draggable={false}
						alt={shape.props.altText}
					/>
				{/key}
			{/if}
			{#if nextSrc}
				{#key nextSrc}
					<img
						class="tl-image"
						style={flipStyle}
						crossorigin={crossOrigin}
						src={nextSrc}
						referrerpolicy="strict-origin-when-cross-origin"
						draggable={false}
						alt={shape.props.altText}
						onload={() => (loadedUrl = nextSrc)}
					/>
				{/key}
			{/if}
		</div>
		{#if shape.props.url}<HyperlinkButton url={shape.props.url} />{/if}
	</HTMLContainer>
{/if}
