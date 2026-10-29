import { SerializedSchema } from '@svelte-draw/store'
import { TLAsset, TLBinding, TLShape, TLShapeId, TLUser } from '@svelte-draw/tlschema'

/** @public */
export interface TLContent {
	shapes: TLShape[]
	bindings: TLBinding[] | undefined
	rootShapeIds: TLShapeId[]
	assets: TLAsset[]
	schema: SerializedSchema
	users?: TLUser[]
}
