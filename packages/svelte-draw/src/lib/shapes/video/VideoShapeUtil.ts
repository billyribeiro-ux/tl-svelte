import {
	BaseBoxShapeUtil,
	createShapeId,
	defineMessages,
	MediaHelpers,
	type SvgExportContext,
	type TLAsset,
	type TLShapePartial,
	type TLVideoAsset,
	type TLVideoShape,
	translateMessage,
	shapeView,
	type VecModel,
	videoShapeMigrations,
	videoShapeProps,
	WeakCache,
} from '@svelte-draw/editor'
import type { ShapeOptionsWithDisplayValues } from '../shared/getDisplayValues'
import SvgVideo from './SvgVideo.svelte'
import VideoShape from './VideoShape.svelte'

const videoSvgExportCache = new WeakCache<TLAsset, Promise<string | null>>()

/** @public */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VideoShapeUtilDisplayValues {}

/** @public */
export interface VideoShapeOptions extends ShapeOptionsWithDisplayValues<
	TLVideoShape,
	VideoShapeUtilDisplayValues
> {
	/**
	 * Should videos play automatically?
	 */
	autoplay: boolean
}

const messages = defineMessages({
	name: { id: 'a11y.shape-video', defaultMessage: 'Video' },
})

/** @public */
export class VideoShapeUtil extends BaseBoxShapeUtil<TLVideoShape> {
	static override type = 'video' as const
	static override props = videoShapeProps
	static override migrations = videoShapeMigrations
	static override handledAssetTypes = ['video'] as const

	override options: VideoShapeOptions = {
		autoplay: true,
		getDefaultDisplayValues(): VideoShapeUtilDisplayValues {
			return {}
		},
		getCustomDisplayValues(): Partial<VideoShapeUtilDisplayValues> {
			return {}
		},
	}

	override getShapeName() {
		return translateMessage(this.editor.i18n(), messages.name)
	}

	override canEdit(shape: TLVideoShape) {
		return true
	}
	override isAspectRatioLocked(shape: TLVideoShape) {
		return true
	}

	override getDefaultProps(): TLVideoShape['props'] {
		return {
			w: 100,
			h: 100,
			assetId: null,
			autoplay: this.options.autoplay,
			url: '',
			altText: '',
			// Not used, but once upon a time were used to sync video state between users
			time: 0,
			playing: true,
		}
	}

	override createShapeForAsset(asset: TLAsset, position: VecModel): TLShapePartial | null {
		const videoAsset = asset as TLVideoAsset
		return {
			id: createShapeId(),
			type: 'video',
			x: position.x,
			y: position.y,
			opacity: 1,
			props: {
				assetId: videoAsset.id,
				w: videoAsset.props.w,
				h: videoAsset.props.h,
			},
		}
	}

	override getAriaDescriptor(shape: TLVideoShape) {
		return shape.props.altText
	}

	component(shape: TLVideoShape) {
		return shapeView(VideoShape, { shape })
	}

	override getIndicatorPath(shape: TLVideoShape): Path2D {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}

	override async toSvg(shape: TLVideoShape, ctx: SvgExportContext) {
		const props = shape.props
		if (!props.assetId) return null

		const asset = this.editor.getAsset<TLAsset>(props.assetId)
		if (!asset) return null

		const promise = videoSvgExportCache.get(asset, async () => {
			const assetUrl = await ctx.resolveAssetUrl(asset.id, props.w)
			if (!assetUrl) return null
			const video = await MediaHelpers.loadVideo(assetUrl, this.editor.getContainerDocument())
			return await MediaHelpers.getVideoFrameAsDataUrl(video, 0)
		})
		const src = await promise.catch((error) => {
			// A failure must not stay memoized, or every later export of this asset fails too. Only
			// evict our own entry: a concurrent export may have started a fresh one. Skip the video
			// rather than rejecting: toSvg rejections are not caught by the exporter, which then
			// waits out the export delay and emits an SVG with no shapes at all.
			if (videoSvgExportCache.items.get(asset) === promise) videoSvgExportCache.items.delete(asset)
			console.error(`Could not export video ${asset.id}`, error)
			return null
		})

		if (!src) return null

		return shapeView(SvgVideo, { shape, src })
	}
}
