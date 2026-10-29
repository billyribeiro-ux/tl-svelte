import { registerSvelteDrawLibraryVersion } from '@svelte-draw/utils'
// eslint-disable-next-line svelte-draw/no-export-star
export * from '@svelte-draw/sync-core'

export {
	createSync,
	type RemoteTLStoreWithStatus,
	type UseSyncConnectFn,
	type UseSyncOptions,
	type UseSyncOptionsBase,
	type UseSyncOptionsWithConnectFn,
	type UseSyncOptionsWithUri,
} from './createSync.svelte'
export { createSyncDemo, type UseSyncDemoOptions } from './createSyncDemo.svelte'

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
