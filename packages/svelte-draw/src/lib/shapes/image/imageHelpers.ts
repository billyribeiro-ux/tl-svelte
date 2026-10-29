import {
	Editor,
	getGlobalDocument,
	Image,
	MediaHelpers,
	modulate,
	type TLAssetId,
	type TLImageShape,
} from '@svelte-draw/editor'
import { getUncroppedSize } from '../shared/crop'

export function getIsAnimated(editor: Editor, assetId: TLAssetId) {
	const asset = assetId ? editor.getAsset(assetId) : undefined

	if (!asset) return false

	return (
		('mimeType' in asset.props && MediaHelpers.isAnimatedImageType(asset?.props.mimeType)) ||
		('isAnimated' in asset.props && asset.props.isAnimated)
	)
}

/**
 * When an image is cropped we need to translate the image to show the portion withing the cropped
 * area. We do this by translating the image by the negative of the top left corner of the crop
 * area.
 *
 * @param shape - Shape The image shape for which to get the container style
 * @returns - Styles to apply to the image container
 */
export function getCroppedContainerStyle(shape: TLImageShape) {
	const crop = shape.props.crop
	const topLeft = crop?.topLeft
	if (!topLeft) {
		return {
			width: shape.props.w,
			height: shape.props.h,
		}
	}

	const { w, h } = getUncroppedSize(shape.props, crop)
	const offsetX = -topLeft.x * w
	const offsetY = -topLeft.y * h
	return {
		transform: `translate(${offsetX}px, ${offsetY}px)`,
		width: w,
		height: h,
	}
}

export function getFlipStyle(shape: TLImageShape, size?: { width: number; height: number }) {
	const { flipX, flipY, crop } = shape.props
	if (!flipX && !flipY) return undefined

	let cropOffsetX
	let cropOffsetY
	if (crop) {
		// We have to do all this extra math because of the whole transform origin around 0,0
		// instead of center in SVG-land, ugh.
		const { w, h } = getUncroppedSize(shape.props, crop)

		// Find the resulting w/h of the crop in normalized (0-1) coordinates
		const cropWidth = crop.bottomRight.x - crop.topLeft.x
		const cropHeight = crop.bottomRight.y - crop.topLeft.y

		// Map from the normalized crop coordinate space to shape pixel space
		cropOffsetX = modulate(crop.topLeft.x, [0, 1 - cropWidth], [0, w - shape.props.w])
		cropOffsetY = modulate(crop.topLeft.y, [0, 1 - cropHeight], [0, h - shape.props.h])
	}

	const scale = `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})`
	const translate = size
		? `translate(${(flipX ? size.width : 0) - (cropOffsetX ? cropOffsetX : 0)}px,
		             ${(flipY ? size.height : 0) - (cropOffsetY ? cropOffsetY : 0)}px)`
		: ''

	return {
		transform: `${translate} ${scale}`,
		// in SVG, flipping around the center doesn't work so we use explicit width/height
		transformOrigin: size ? '0 0' : 'center center',
	}
}

export function getFirstFrameOfAnimatedImage(url: string) {
	let cancelled = false

	// Must settle on failure too: an image that never loads would otherwise leave the
	// export awaiting this promise forever.
	const promise = new Promise<string>((resolve, reject) => {
		const image = Image()
		image.onload = () => {
			if (cancelled) return

			const canvas = getGlobalDocument().createElement('canvas')
			canvas.width = image.width
			canvas.height = image.height

			const ctx = canvas.getContext('2d')
			if (!ctx) {
				reject(new Error('Could not get a 2d canvas context'))
				return
			}

			ctx.drawImage(image, 0, 0)
			resolve(canvas.toDataURL())
		}
		image.onerror = () => {
			if (cancelled) return
			reject(new Error(`Could not load image: ${url}`))
		}
		image.crossOrigin = 'anonymous'
		image.src = url
	})

	return { promise, cancel: () => (cancelled = true) }
}
