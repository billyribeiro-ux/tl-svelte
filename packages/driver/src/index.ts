import { registerSvelteDrawLibraryVersion } from '@svelte-draw/utils'

export { Driver } from './lib/Driver'
export type { EventModifiers, PointerEventInit } from './lib/Driver'

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
