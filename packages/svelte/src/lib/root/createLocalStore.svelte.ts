import type { TLEditorSnapshot, TLStoreOptions, TLStoreWithStatus } from '@svelte-draw/editor'
import { createTLStore } from '@svelte-draw/editor'
import type { TLAssetId, TLAssetStore, TLStoreSnapshot } from '@svelte-draw/tlschema'
import { noop } from '@svelte-draw/utils'
import { untrack } from 'svelte'
import { TLLocalSyncClient } from './editorInternals'
import { shallowObjectIdentity } from './identity.svelte'

/** @internal */
export type LocalStoreOptions = {
	persistenceKey?: string
	sessionId?: string
	snapshot?: TLEditorSnapshot | TLStoreSnapshot
} & TLStoreOptions

/**
 * Creates a store, persisted to IndexedDB when `persistenceKey` is set, and tracks its loading
 * status. Call during component initialisation: it registers an effect. The options object is
 * compared shallowly, so a new-but-equal object from the caller does not recreate the store.
 *
 * @internal
 */
export function createLocalStore(getOptions: () => LocalStoreOptions): {
	readonly current: TLStoreWithStatus
} {
	let state = $state.raw<TLStoreWithStatus>({ status: 'loading' })
	const options = shallowObjectIdentity(getOptions)

	$effect(() => {
		const { persistenceKey, sessionId, ...rest } = options.current

		return untrack(() => {
			if (!persistenceKey) {
				state = {
					status: 'not-synced',
					store: createTLStore(rest),
				}
				return
			}

			state = { status: 'loading' }

			// Keyed by asset id rather than record identity so that a record update doesn't mint
			// another object url for the same blob; every url minted here is revoked on cleanup.
			const objectURLCache = new Map<TLAssetId, Promise<string | null>>()
			const assets: TLAssetStore = {
				upload: async (asset, file) => {
					await client.db.storeAsset(asset.id, file)
					return { src: asset.id }
				},
				resolve: async (asset) => {
					if (!asset.props.src) return null

					if (asset.props.src.startsWith('asset:')) {
						let objectURL = objectURLCache.get(asset.id)
						if (!objectURL) {
							objectURL = client.db
								.getAsset(asset.id)
								.then((blob) => (blob ? URL.createObjectURL(blob) : null))
							objectURLCache.set(asset.id, objectURL)
						}
						return await objectURL
					}

					return asset.props.src
				},
				remove: async (assetIds) => {
					await client.db.removeAssets(assetIds)
				},
				...rest.assets,
			}

			const store = createTLStore({ ...rest, assets })

			let isClosed = false

			const client = new TLLocalSyncClient(store, {
				sessionId,
				persistenceKey,
				onLoad() {
					if (isClosed) return
					state = { store, status: 'synced-local' }
				},
				onLoadError(err: any) {
					if (isClosed) return
					state = { status: 'error', error: err }
				},
			})

			return () => {
				isClosed = true
				client.close()
				for (const objectURL of objectURLCache.values()) {
					objectURL.then((url) => url && URL.revokeObjectURL(url), noop)
				}
			}
		})
	})

	return {
		get current() {
			return state
		},
	}
}
