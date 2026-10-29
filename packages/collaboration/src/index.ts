import { registerSvelteDrawLibraryVersion } from '@svelte-draw/utils'

// The collaboration umbrella. For now it re-exports the commenting package; over time it
// will re-export the other collaboration packages as well.

// eslint-disable-next-line svelte-draw/no-export-star
export * from '@svelte-draw/commenting'

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
