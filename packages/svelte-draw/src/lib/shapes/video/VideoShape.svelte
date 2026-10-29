<script lang="ts">
	import type { TLVideoShape } from '@svelte-draw/editor'
	import {
		fromComputed,
		getEditor,
		getEditorComponents,
		HTMLContainer,
		useIsEditing,
	} from '@svelte-draw/svelte'
	import BrokenAssetIcon from '../shared/BrokenAssetIcon.svelte'
	import HyperlinkButton from '../shared/HyperlinkButton.svelte'
	import { styleToString } from '../shared/styleToString'
	import { useImageOrVideoAsset } from '../shared/useImageOrVideoAsset.svelte'
	import { usePrefersReducedMotion } from '../shared/usePrefersReducedMotion.svelte'

	let { shape }: { shape: TLVideoShape } = $props()

	const editor = getEditor()
	const showControls = fromComputed(
		'showControls',
		() => editor.getShapeGeometry(shape).bounds.w * editor.getEfficientZoomLevel() >= 110
	)
	const isEditing = useIsEditing(() => shape.id)
	const prefersReducedMotion = usePrefersReducedMotion()
	const components = getEditorComponents()
	const Spinner = $derived(components.Spinner)

	const assetState = useImageOrVideoAsset(() => ({
		shapeId: shape.id,
		assetId: shape.props.assetId,
		width: shape.props.w,
	}))
	const asset = $derived(assetState.asset)
	const url = $derived(assetState.url)

	let rVideo = $state<HTMLVideoElement | null>(null)

	let isLoaded = $state(false)

	function handleLoadedData(e: Event) {
		const video = e.currentTarget as HTMLVideoElement | null
		if (!video) return
		isLoaded = true
	}

	let isFullscreen = $state(false)

	$effect(() => {
		const video = rVideo
		const doc = video?.ownerDocument ?? editor.getContainerDocument()
		const fullscreenChange = () => {
			isFullscreen = doc.fullscreenElement === video
		}
		doc.addEventListener('fullscreenchange', fullscreenChange)

		return () => doc.removeEventListener('fullscreenchange', fullscreenChange)
	})

	// Focus the video when editing
	$effect(() => {
		// dependencies: isEditing, isLoaded (the video element is replaced when the url changes)
		void isLoaded
		const video = rVideo
		if (!video) return

		if (isEditing.current) {
			if (video.ownerDocument.activeElement !== video) {
				video.focus()
			}
		}
	})

	const hasVideo = $derived(!!asset?.props.src && !!url && isLoaded)
	const videoStyle = $derived(
		isEditing.current ? 'pointer-events: all' : !isLoaded ? 'display: none' : undefined
	)
</script>

<HTMLContainer
	id={shape.id}
	style={styleToString({
		color: 'var(--tl-color-text-3)',
		backgroundColor: hasVideo ? 'transparent' : 'var(--tl-color-low)',
		border: hasVideo ? 'none' : '1px solid var(--tl-color-low-border)',
	})}
>
	<div class="tl-counter-scaled">
		<div class="tl-video-container">
			{#if !asset}
				<BrokenAssetIcon />
			{:else if Spinner && !asset.props.src}
				<Spinner />
			{:else if url}
				{#key url}
					<video
						bind:this={rVideo}
						style={videoStyle}
						class={[
							'tl-video',
							`tl-video-shape-${shape.id.split(':')[1]}`,
							isFullscreen && 'tl-video-is-fullscreen',
						]}
						width="100%"
						height="100%"
						draggable={false}
						playsinline
						autoplay={shape.props.autoplay && !prefersReducedMotion.current}
						muted
						loop
						disableremoteplayback
						disablepictureinpicture
						controls={isEditing.current && showControls.current}
						onloadeddata={handleLoadedData}
						hidden={!isLoaded}
						aria-label={shape.props.altText}
					>
						<source src={url} />
					</video>
				{/key}
				{#if !isLoaded && Spinner}<Spinner />{/if}
			{/if}
		</div>
	</div>
</HTMLContainer>
{#if 'url' in shape.props && shape.props.url}<HyperlinkButton url={shape.props.url} />{/if}
