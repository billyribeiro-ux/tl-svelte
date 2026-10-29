<script lang="ts" module>
	import { defineMessages, type TLI18nMessage, type TLImageShape } from '@svelte-draw/editor'
	import type { ASPECT_RATIO_OPTION } from '../../../shapes/shared/crop'

	/** @public */
	export interface DefaultImageToolbarContentProps {
		imageShapeId: TLImageShape['id']
		isManipulating: boolean
		onEditAltTextStart(): void
		onManipulatingStart(): void
		onManipulatingEnd(): void
	}

	const messages = defineMessages({
		actionDownloadOriginal: {
			id: 'action.download-original',
			defaultMessage: 'Download original',
		},
		toolReplaceMedia: { id: 'tool.replace-media', defaultMessage: 'Replace media…' },
		toolAspectRatio: { id: 'tool.aspect-ratio', defaultMessage: 'Aspect ratio' },
		toolImageCrop: { id: 'tool.image-crop', defaultMessage: 'Crop image' },
		toolImageCropConfirm: { id: 'tool.image-crop-confirm', defaultMessage: 'Confirm' },
		toolImageZoom: { id: 'tool.image-zoom', defaultMessage: 'Zoom' },
		toolMediaAltText: { id: 'tool.media-alt-text', defaultMessage: 'Alternative text' },
	})

	// Keyed on the option rather than written at the call site, which used to compose the id from
	// `aspectRatio` and so hid every one of these from the extractor. The `Record` keeps it complete:
	// a new option won't compile until it has a label.
	const aspectRatioMessages: Record<ASPECT_RATIO_OPTION, TLI18nMessage> = defineMessages({
		original: { id: 'tool.aspect-ratio.original', defaultMessage: 'Original' },
		square: { id: 'tool.aspect-ratio.square', defaultMessage: 'Square (1:1)' },
		circle: { id: 'tool.aspect-ratio.circle', defaultMessage: 'Circle (1:1)' },
		landscape: { id: 'tool.aspect-ratio.landscape', defaultMessage: 'Landscape (4:3)' },
		portrait: { id: 'tool.aspect-ratio.portrait', defaultMessage: 'Portrait (3:4)' },
		wide: { id: 'tool.aspect-ratio.wide', defaultMessage: 'Wide (16:9)' },
	})
</script>

<script lang="ts">
	import {
		approximately,
		isEqual,
		kickoutOccludedShapes,
		modulate,
		type TLShapePartial,
	} from '@svelte-draw/editor'
	import { fromComputed, getEditor } from '@svelte-draw/svelte'
	import {
		ASPECT_RATIO_OPTIONS,
		ASPECT_RATIO_TO_VALUE,
		getCroppedImageDataForAspectRatio,
		getCroppedImageDataWhenZooming,
		getDefaultCrop,
		MAX_ZOOM,
	} from '../../../shapes/shared/crop'
	import { getActions } from '../../context/actions.svelte'
	import { getUiEvents } from '../../context/events'
	import { getTranslation } from '../../hooks/useTranslation/useTranslation.svelte'
	import SvelteDrawUiButtonIcon from '../primitives/Button/SvelteDrawUiButtonIcon.svelte'
	import SvelteDrawUiButtonLabel from '../primitives/Button/SvelteDrawUiButtonLabel.svelte'
	import SvelteDrawUiDropdownMenuCheckboxItem from '../primitives/SvelteDrawUiDropdownMenuCheckboxItem.svelte'
	import SvelteDrawUiDropdownMenuContent from '../primitives/SvelteDrawUiDropdownMenuContent.svelte'
	import SvelteDrawUiDropdownMenuRoot from '../primitives/SvelteDrawUiDropdownMenuRoot.svelte'
	import SvelteDrawUiDropdownMenuTrigger from '../primitives/SvelteDrawUiDropdownMenuTrigger.svelte'
	import SvelteDrawUiSlider from '../primitives/SvelteDrawUiSlider.svelte'
	import SvelteDrawUiToolbarButton from '../primitives/SvelteDrawUiToolbarButton.svelte'

	const MAX_RATIO_CONVERSION = MAX_ZOOM / (MAX_ZOOM - 1)

	// Apply an easing function to smooth out the zoom curve,
	// otherwise the zoom slider has a cubic drag feel to it which feels off.
	function easeZoom(value: number, maxValue: number): number {
		// Use an easing function for a more natural zoom feel
		return Math.pow(value / maxValue, MAX_RATIO_CONVERSION) * maxValue
	}

	let {
		imageShapeId,
		isManipulating,
		onEditAltTextStart,
		onManipulatingStart,
		onManipulatingEnd,
	}: DefaultImageToolbarContentProps = $props()

	const editor = getEditor()
	const trackEvent = getUiEvents()
	const msg = getTranslation()
	const actions = getActions()
	const source = 'image-toolbar'
	let sliderElm = $state<HTMLElement | null>(null)

	// `track` made the React component re-render when this changed.
	const isReadonly = fromComputed('is readonly', () => editor.getIsReadonly())

	const crop = fromComputed('crop', () => editor.getShape<TLImageShape>(imageShapeId)!.props.crop)
	const zoom = $derived(
		crop.current
			? Math.min(
					1 - (crop.current.bottomRight.x - crop.current.topLeft.x),
					1 - (crop.current.bottomRight.y - crop.current.topLeft.y)
				)
			: 0
	)
	// So, we set a maxZoom here in case there's been a manual crop applied.
	// Typically, you can zoom 3x into the image size (MAX_ZOOM's value).
	// If you go deeper than that zoom level, we need to set that as the new 100%
	// value on the zoom slider (otherwise you could zoom into infinity).
	// This balances usage of the zoom slider with manual cropping.
	const maxZoom = $derived(crop.current ? Math.max(zoom, 1 - 1 / MAX_ZOOM) : MAX_ZOOM)

	function onHistoryMark(id: string) {
		editor.markHistoryStoppingPoint(id)
	}

	const displayValue = $derived(
		crop.current ? modulate(easeZoom(zoom, maxZoom), [0, maxZoom], [0, 100], true /* clamp */) : 0
	)

	function handleZoomChange(value: number) {
		editor.setCurrentTool('select.crop.idle')
		// Convert the eased slider value back to the actual zoom value
		const sliderPercent = value / 100

		// Convert the slider position back into the "zoom" value expected by
		// getCroppedImageDataWhenZooming.
		// 1. Undo the easing: z_out = sliderPercent^(1/maxRatioConversion) * maxZoom
		// 2. Translate z_out into the function's input domain. The helper computes
		//    the *resulting* zoom (z_out) using:
		//        z_out = 2 * z_in / (1 + 2 * z_in)
		//    Solving for z_in gives:
		//        z_in = z_out / (2 * (1 - z_out))
		const maxDimension = 1 - 1 / MAX_ZOOM
		const clampedMaxZoom = Math.min(maxDimension, maxZoom)
		const zOut = Math.pow(sliderPercent, 1 / MAX_RATIO_CONVERSION) * clampedMaxZoom
		const nextZoom = zOut >= 1 ? 1 : zOut / (2 * (1 - zOut))
		const imageShape = editor.getShape<TLImageShape>(imageShapeId)
		if (!imageShape) return

		const change = getCroppedImageDataWhenZooming(nextZoom, imageShape, maxZoom)

		editor.updateShape({
			id: imageShape.id,
			type: imageShape.type,
			x: change.x,
			y: change.y,
			props: {
				w: change.w,
				h: change.h,
				crop: change.crop,
			},
		} as TLShapePartial)

		trackEvent('set-style', { source: 'image-toolbar', id: 'zoom', value })
	}

	function handleImageReplace() {
		actions['image-replace'].onSelect('image-toolbar')
	}

	function handleImageDownload() {
		actions['download-original'].onSelect('image-toolbar')
	}

	function handleAspectRatioChange(aspectRatio: ASPECT_RATIO_OPTION) {
		const imageShape = editor.getShape<TLImageShape>(imageShapeId)
		if (!imageShape) return
		editor.run(() => {
			editor.setCurrentTool('select.crop.idle')
			const change = getCroppedImageDataForAspectRatio(aspectRatio, imageShape)
			editor.markHistoryStoppingPoint('aspect ratio')
			editor.updateShape({
				id: imageShapeId,
				type: 'image',
				x: change.x,
				y: change.y,
				props: {
					crop: change.crop,
					w: change.w,
					h: change.h,
				},
			} as TLShapePartial)
			kickoutOccludedShapes(editor, [imageShapeId])
		})
	}

	const altText = fromComputed(
		'altText',
		() => editor.getShape<TLImageShape>(imageShapeId)!.props.altText
	)
	const shapeAspectRatio = fromComputed('shapeAspectRatio', () => {
		const imageShape = editor.getShape<TLImageShape>(imageShapeId)!
		return imageShape.props.w / imageShape.props.h
	})
	const isOriginalCrop = $derived(!crop.current || isEqual(crop.current, getDefaultCrop()))

	function isAspectRatioChecked(aspectRatio: ASPECT_RATIO_OPTION) {
		const currentCrop = crop.current
		if (isOriginalCrop) return aspectRatio === 'original'
		if (aspectRatio === 'circle') return !!currentCrop?.isCircle
		if (aspectRatio === 'square') {
			return (
				!currentCrop?.isCircle &&
				approximately(shapeAspectRatio.current, ASPECT_RATIO_TO_VALUE[aspectRatio], 0.1)
			)
		}
		if (aspectRatio !== 'original') {
			return approximately(shapeAspectRatio.current, ASPECT_RATIO_TO_VALUE[aspectRatio], 0.01)
		}
		return false
	}

	$effect(() => {
		if (isManipulating) {
			editor.timers.setTimeout(() => sliderElm?.focus(), 0)
		}
	})

	$effect(() => {
		const elm = sliderElm
		if (!elm) return

		function handleKeyDown(e: KeyboardEvent) {
			if (!isManipulating) return
			if (e.key === 'Escape') {
				editor.cancel()
			} else if (e.key === 'Enter') {
				editor.complete()
			} else {
				return
			}
			onManipulatingEnd()
			// Otherwise the keydown bubbles to the container's handler, which cancels again
			// against select.idle and clears the selection (#10405). Leaving crop mode also
			// unmounts the slider, so refocus the container to keep shortcuts working.
			e.stopPropagation()
			editor.getContainer().focus()
		}
		elm.addEventListener('keydown', handleKeyDown)
		return () => elm.removeEventListener('keydown', handleKeyDown)
	})
</script>

{#if isManipulating}
	<SvelteDrawUiSlider
		bind:ref={sliderElm}
		value={displayValue}
		label={messages.toolImageZoom.id}
		onValueChange={handleZoomChange}
		{onHistoryMark}
		min={0}
		steps={100}
		data-testid="tool.image-zoom"
		title={msg(messages.toolImageZoom)}
	/>
	<SvelteDrawUiDropdownMenuRoot id="image-toolbar-aspect-ratio">
		<SvelteDrawUiDropdownMenuTrigger>
			{#snippet child({ props })}
				<SvelteDrawUiToolbarButton
					{...props}
					title={msg(messages.toolAspectRatio)}
					type="icon"
					data-testid="tool.image-aspect-ratio"
				>
					<SvelteDrawUiButtonIcon icon="corners" />
				</SvelteDrawUiToolbarButton>
			{/snippet}
		</SvelteDrawUiDropdownMenuTrigger>
		<SvelteDrawUiDropdownMenuContent side="top" align="center">
			{#each ASPECT_RATIO_OPTIONS as aspectRatio (aspectRatio)}
				<SvelteDrawUiDropdownMenuCheckboxItem
					onSelect={() => handleAspectRatioChange(aspectRatio)}
					checked={isAspectRatioChecked(aspectRatio)}
					title={msg(aspectRatioMessages[aspectRatio])}
				>
					<SvelteDrawUiButtonLabel>
						{msg(aspectRatioMessages[aspectRatio])}
					</SvelteDrawUiButtonLabel>
				</SvelteDrawUiDropdownMenuCheckboxItem>
			{/each}
		</SvelteDrawUiDropdownMenuContent>
	</SvelteDrawUiDropdownMenuRoot>
	<SvelteDrawUiToolbarButton
		type="icon"
		onclick={onManipulatingEnd}
		data-testid="tool.image-crop-confirm"
		style="border-left: 1px solid var(--tl-color-divider); margin-left: 2px;"
		title={msg(messages.toolImageCropConfirm)}
	>
		<SvelteDrawUiButtonIcon small icon="check" />
	</SvelteDrawUiToolbarButton>
{:else}
	{#if !isReadonly.current}
		<SvelteDrawUiToolbarButton
			type="icon"
			data-testid="tool.image-replace"
			onclick={handleImageReplace}
			title={msg(messages.toolReplaceMedia)}
		>
			<SvelteDrawUiButtonIcon small icon="tool-media" />
		</SvelteDrawUiToolbarButton>
		<SvelteDrawUiToolbarButton
			type="icon"
			title={msg(messages.toolImageCrop)}
			onclick={onManipulatingStart}
			data-testid="tool.image-crop"
		>
			<SvelteDrawUiButtonIcon small icon="crop" />
		</SvelteDrawUiToolbarButton>
	{/if}
	<SvelteDrawUiToolbarButton
		type="icon"
		title={msg(messages.actionDownloadOriginal)}
		onclick={handleImageDownload}
		data-testid="tool.image-download"
	>
		<SvelteDrawUiButtonIcon small icon="download" />
	</SvelteDrawUiToolbarButton>
	{#if altText.current || !isReadonly.current}
		<SvelteDrawUiToolbarButton
			type="icon"
			title={msg(messages.toolMediaAltText)}
			data-testid="tool.image-alt-text"
			onclick={() => {
				trackEvent('alt-text-start', { source })
				onEditAltTextStart()
			}}
		>
			<SvelteDrawUiButtonIcon small icon="alt" />
		</SvelteDrawUiToolbarButton>
	{/if}
{/if}
