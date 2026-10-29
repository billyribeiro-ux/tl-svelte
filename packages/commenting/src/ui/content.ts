import type { Snippet } from 'svelte'

/**
 * Content for a slot that React typed as `ReactNode`: plain text, or a snippet for anything richer.
 * Render it with `<Content value={...} />`.
 * @public
 */
export type CommentContent = string | Snippet
