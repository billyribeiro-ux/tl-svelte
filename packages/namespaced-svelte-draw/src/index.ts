import { registerSvelteDrawLibraryVersion } from 'svelte-draw'
// eslint-disable-next-line svelte-draw/no-export-star
export * from 'svelte-draw'

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
