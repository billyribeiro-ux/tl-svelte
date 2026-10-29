import { AssetUtil, T, type TLAssetId, type TLBaseAsset } from 'svelte-draw'

// [1]
export const FILE_ASSET_TYPE = 'file' as const

interface FileAssetProps {
	name: string
	size: number
	mimeType: string
	src: string | null
}

export type TLFileAsset = TLBaseAsset<typeof FILE_ASSET_TYPE, FileAssetProps>

declare module 'svelte-draw' {
	interface TLGlobalAssetPropsMap {
		[FILE_ASSET_TYPE]: FileAssetProps
	}
}

// [2]
export class FileAssetUtil extends AssetUtil<TLFileAsset> {
	static override type = FILE_ASSET_TYPE

	static supportedMimeTypes = [
		'application/pdf',
		'text/plain',
		'text/csv',
		'application/json',
		'application/zip',
		'application/xml',
		'text/xml',
	] as const

	static supportedExtensions = ['.pdf', '.txt', '.csv', '.json', '.zip', '.xml'] as const

	// [3]
	static override props = {
		name: T.string,
		size: T.number,
		mimeType: T.string,
		src: T.string.nullable(),
	}

	override getDefaultProps(): TLFileAsset['props'] {
		return {
			name: '',
			size: 0,
			mimeType: '',
			src: null,
		}
	}

	// [4]
	override getSupportedMimeTypes() {
		return [...FileAssetUtil.supportedMimeTypes]
	}

	// [5]
	override async getAssetFromFile(file: File, assetId: TLAssetId): Promise<TLFileAsset> {
		return {
			id: assetId,
			type: FILE_ASSET_TYPE,
			typeName: 'asset',
			props: {
				name: file.name,
				size: file.size,
				mimeType: file.type,
				src: null,
			},
			meta: {},
		}
	}
}
