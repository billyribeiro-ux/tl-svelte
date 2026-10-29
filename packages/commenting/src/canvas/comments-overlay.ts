import type { ClusterNode } from '../clustering/types'
import type { CommentingContext } from './context'

/**
 * The host wiring for {@link CanvasComments} — see {@link CommentingContext}, which the sidebar
 * takes the same fields from.
 *
 * @public
 */
export type CanvasCommentsProps = CommentingContext

/**
 * Which thread's pin a fade node should draw: its own thread for a single pin, `stackOwner` (when
 * still a member) for a coincident stack, null for neither. Never the open thread — the open-thread
 * render slot draws that one, and drawing it here too (which the fade-out window would otherwise
 * do) mounts its popover twice.
 * @internal
 */
export function fadeNodeMarkerThreadId(
	node: ClusterNode,
	stackOwner: string | null,
	openId: string | null
): string | null {
	const candidate =
		node.count === 1 ? node.id : stackOwner && node.members.includes(stackOwner) ? stackOwner : null
	return candidate === openId ? null : candidate
}
