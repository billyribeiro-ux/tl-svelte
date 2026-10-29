import { EditorAtom, type BoxModel, type Editor } from 'svelte-draw'
import type { PendingComment } from './comment-tool'
import { DEFAULT_SIDEBAR_FILTERS, type SidebarFilters } from './sidebar-filters'

/**
 * Transient commenting UI state, scoped per editor via {@link EditorAtom} so two editors on one
 * page don't share open-thread, visibility, and filter state. Reachable from both components
 * (`getEditor()`) and the comment tool (`this.editor`).
 */

/** The id of the one open thread (only one popover is open at a time), or null when all closed.
 * @public */
export const openThreadId = new EditorAtom<string | null>('openThreadId', () => null)

/** The coincident-pin stack whose thread list is showing (keyed by its oldest member's thread id),
 *  or null. Editor state rather than component state: the stack pin remounts when its owning render
 *  path changes, and the open list must survive that.
 *  @internal */
export const openStackId = new EditorAtom<string | null>('openStackId', () => null)

/** The comment currently being placed (composer open, not yet posted), or null.
 * @internal */
export const pendingComment = new EditorAtom<PendingComment | null>('pendingComment', () => null)

/**
 * A pending request to reveal a thread: a thread or comment id to open and bring into view, or
 * null when none is pending. Written by {@link revealThread}; served and cleared by
 * `CanvasComments`, which owns the wait for the records to sync in and the cluster-aware reveal.
 * @internal
 */
export const revealThreadRequest = new EditorAtom<string | null>('revealThreadRequest', () => null)

/**
 * Open a thread and bring it into view, given a thread id or the id of any comment in it. Use it to
 * jump to a thread from outside the canvas — a notification, a deep link, your own list.
 *
 * The request is served by `CanvasComments`, so it works before the records have arrived: the layer
 * waits for them, switches pages, unhides pins, and zooms far enough to split the thread out of any
 * cluster. That also means nothing happens if `CanvasComments` isn't mounted.
 *
 * To open a thread you already hold and skip the wait, see {@link focusThread}.
 *
 * @example
 * ```ts
 * revealThread(editor, new URLSearchParams(location.search).get('comment')!)
 * ```
 *
 * @public
 */
export function revealThread(editor: Editor, threadOrCommentId: string): void {
	revealThreadRequest.set(editor, threadOrCommentId)
}

/**
 * The id passed to the most recent {@link revealThread} call that `CanvasComments` hasn't served
 * yet, or null. A request also clears when `CanvasComments` unmounts.
 *
 * This is a plain, untracked read — in a component, use {@link createRevealThreadPending}, unless you need
 * the value as of *now* rather than as of the render you closed over.
 *
 * @public
 */
export function getRevealThreadPending(editor: Editor): string | null {
	return revealThreadRequest.get(editor)
}

/** The region rectangle being dragged out right now (page coords), or null when not dragging. The
 *  comment tool writes it on each move; the overlay reads it to draw the live dashed box. */
export const regionDraft = new EditorAtom<BoxModel | null>('regionDraft', () => null)

/**
 * Whether comment pins are hidden on the canvas. Governs the on-canvas layer (pins + open popover)
 * only — the sidebar is unaffected.
 * @public
 */
export const commentsHidden = new EditorAtom<boolean>('commentsHidden', () => false)

/**
 * Whether the comments sidebar (the thread list) is open. Driven by an explicit control rather than
 * by which tool is active, so browsing threads is separate from placing them.
 * @public
 */
export const commentsSidebarOpen = new EditorAtom<boolean>('commentsSidebarOpen', () => false)

/** Which threads the comments sidebar shows.
 * @public */
export const sidebarFilters = new EditorAtom<SidebarFilters>(
	'sidebarFilters',
	() => DEFAULT_SIDEBAR_FILTERS
)

/** Toggle comment-pin visibility for an editor.
 * @public */
export function toggleCommentsHidden(editor: Editor): void {
	commentsHidden.update(editor, (hidden) => !hidden)
}

/** Open or close the comments sidebar for an editor.
 * @public */
export function toggleCommentsSidebar(editor: Editor): void {
	commentsSidebarOpen.update(editor, (open) => !open)
}
