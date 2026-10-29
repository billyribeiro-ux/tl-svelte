import { registerSvelteDrawLibraryVersion } from '@svelte-draw/utils'

// Server-side logic for svelte-draw's collaboration features, safe to import from any sync
// server — no react or client-editor dependencies.
export {
	type CommentAuthorizerOptions,
	type CommentModification,
	type CommentModificationAuthContext,
	createCommentAuthorizers,
} from './comment-authorizers'

registerSvelteDrawLibraryVersion(
	(globalThis as any).SVELTE_DRAW_LIBRARY_NAME,
	(globalThis as any).SVELTE_DRAW_LIBRARY_VERSION,
	(globalThis as any).SVELTE_DRAW_LIBRARY_MODULES
)
