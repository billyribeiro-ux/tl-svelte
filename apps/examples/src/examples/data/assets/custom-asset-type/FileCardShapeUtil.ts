import {
	BaseBoxShapeUtil,
	type TLAsset,
	type TLAssetId,
	type TLShape,
	type TLShapePartial,
	type VecModel,
	createShapeId,
	shapeView,
} from 'svelte-draw'
import { FILE_ASSET_TYPE } from './FileAssetUtil'
import FileCardShapeView from './FileCardShape.svelte'

export const FILE_CARD_TYPE = 'file-card' as const

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[FILE_CARD_TYPE]: {
			assetId: TLAssetId | null
			w: number
			h: number
		}
	}
}

export type FileCardShape = TLShape<typeof FILE_CARD_TYPE>

// [6]
export class FileCardShapeUtil extends BaseBoxShapeUtil<FileCardShape> {
	static override type = FILE_CARD_TYPE
	static override handledAssetTypes = [FILE_ASSET_TYPE] as const

	override getDefaultProps() {
		return {
			assetId: null as TLAssetId | null,
			w: 200,
			h: 64,
		}
	}

	// [7]
	override createShapeForAsset(asset: TLAsset, position: VecModel): TLShapePartial {
		return {
			id: createShapeId(),
			type: FILE_CARD_TYPE,
			x: position.x,
			y: position.y,
			props: {
				assetId: asset.id,
				w: 200,
				h: 64,
			},
		}
	}

	override component(shape: FileCardShape) {
		return shapeView(FileCardShapeView, { assetId: shape.props.assetId })
	}

	override getIndicatorPath(shape: FileCardShape) {
		const path = new Path2D()
		path.rect(0, 0, shape.props.w, shape.props.h)
		return path
	}
}
