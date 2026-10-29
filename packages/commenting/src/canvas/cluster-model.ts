import { clamp, react, type Editor, type TLCommentThread } from 'svelte-draw'
import type { ClusterRuntime } from '../clustering/runtime'
import type { ClusterNode, ClusterTable, MergeEvent } from '../clustering/types'
import type { ClusterFadeNode } from './cluster-fade.svelte'
import type { ClusterInput } from './cluster-input'
import type { CommentingOptions } from './options'
import { anchorPagePoint, commentCenterScreenOffset } from './thread-state'

/** Duration of the click-a-badge zoom-to-split animation. */
export const CLUSTER_EXPAND_ZOOM_MS = 450
/** How far past a cluster's split zoom to land when expanding it — a 5% overshoot, so the badge
 *  lands clear of the threshold it just crossed rather than flickering on it. */
const CLUSTER_SPLIT_ZOOM_FACTOR = 1.05

export const EMPTY_SET: ReadonlySet<string> = new Set()
export const MOVED_LEAF_EPSILON = 1e-6

/** Default select-tool states that move shapes continuously, one store write per pointermove. A
 *  custom tool in their place just never matches, falling back to a rebuild per frame. */
export const SHAPE_DRAG_STATE_PATHS = [
	'select.translating',
	'select.resizing',
	'select.rotating',
	'select.dragging_handle',
	'select.crop.cropping',
] as const

/** Reactive: `isInAny` reads the tool state path, so a computed reading this re-evaluates when the
 *  gesture starts or settles. */
export function isShapeDragInProgress(editor: Editor): boolean {
	return editor.isInAny(...SHAPE_DRAG_STATE_PATHS)
}

/** The clustering table for the current scene, plus the runtime walking its merge events. */
export interface ClusterModel {
	runtime: ClusterRuntime
	table: ClusterTable
}

export interface ClusterZoomBounds {
	minZoom: number
	maxZoom: number
}

export interface ClusterModelState {
	/** The partition actually on screen. See {@link createClusterModel} for why it can lag the input. */
	model: ClusterModel
	zoomBounds: ClusterZoomBounds
	/** The displayed nodes, each tagged with its cross-fade phase. */
	fadeNodes: ClusterFadeNode[]
	/** Threads in the input that the displayed partition doesn't show — render them as plain pins. */
	orphanThreads: TLCommentThread[]
	/** Threads held out of clustering because their anchor moved while folded into a badge. */
	heldThreads: TLCommentThread[]
}

/** Run `onZoomOut` on each zoom change that decreased the zoom, starting from the current level. */
export function reactOnZoomOut(editor: Editor, name: string, onZoomOut: (zoom: number) => void) {
	let lastZoom = editor.getZoomLevel()
	return react(name, () => {
		const zoom = editor.getZoomLevel()
		const prevZoom = lastZoom
		lastZoom = zoom
		if (zoom < prevZoom) onZoomOut(zoom)
	})
}

/**
 * Whether a position-only input change (ids equal, same order) moved a leaf folded inside a badge
 * of the rendered partition — the one move the mid-drag freeze must let through.
 *
 * Folded means a member of a displayed badge, not merely "absent from the displayed partition":
 * the input also carries orphans (threads the rendered partition has never seen) and detached
 * leaves, which already ride their anchors as plain pins. Neither is in the rendered table, so the
 * pop-out below can never hold one — counting them here would break the freeze on every
 * pointermove for the rest of the drag.
 * @internal
 */
export function anyFoldedLeafMoved(
	prev: ClusterInput,
	next: ClusterInput,
	rendered: ClusterModel | null
): boolean {
	if (!rendered) return false
	if (prev.leaves.length !== next.leaves.length) return false
	const folded = new Set<string>()
	for (const node of rendered.runtime.getVisible().values()) {
		if (node.count < 2) continue
		for (const member of node.members) folded.add(member)
	}
	// No badges on screen, so nothing can be folded — the common case, and the cheap way out of it.
	if (folded.size === 0) return false
	for (let i = 0; i < next.leaves.length; i++) {
		if (!folded.has(next.leaves[i].id)) continue
		const a = prev.leaves[i].point
		const b = next.leaves[i].point
		if (Math.abs(a.x - b.x) > MOVED_LEAF_EPSILON || Math.abs(a.y - b.y) > MOVED_LEAF_EPSILON) {
			return true
		}
	}
	return false
}

/**
 * Leaves folded inside a badge whose live anchor no longer matches the position the rendered
 * model was built with. Visible (unclustered) leaf pins track their anchor live, so they can
 * stay deferred; a badge can't follow a member, so these must pop out of clustering.
 */
/** @internal */
export function findMovedClusteredLeafIds(rendered: ClusterModel, latest: { table: ClusterTable }) {
	if (rendered.table === latest.table) return []
	const visible = rendered.runtime.getVisible()
	const latestById = new Map(latest.table.leaves.map((leaf) => [leaf.id, leaf]))
	const moved: string[] = []
	for (const leaf of rendered.table.leaves) {
		if (visible.has(leaf.id)) continue
		const current = latestById.get(leaf.id)
		if (!current) continue
		if (
			Math.abs(current.centroid.x - leaf.centroid.x) > MOVED_LEAF_EPSILON ||
			Math.abs(current.centroid.y - leaf.centroid.y) > MOVED_LEAF_EPSILON
		) {
			moved.push(leaf.id)
		}
	}
	return moved
}

/** @internal */
export function getClusterZoomBounds(editor: Editor): ClusterZoomBounds {
	const cameraOptions = editor.getCameraOptions()
	const baseZoom = cameraOptions.constraints ? editor.getBaseZoom() : 1
	const zoomSteps = cameraOptions.zoomSteps
	return {
		minZoom: zoomSteps[0] * baseZoom,
		maxZoom: zoomSteps[zoomSteps.length - 1] * baseZoom,
	}
}

/**
 * Bring a thread's pin into view: switch pages if needed, then zoom to the first cluster split
 * that unfolds it from its badge (or just centre on it when it isn't clustered).
 */
export function revealThreadPin(
	editor: Editor,
	thread: TLCommentThread,
	table: ClusterTable,
	zoomBounds: ClusterZoomBounds,
	options: CommentingOptions,
	duration = 200
) {
	if (thread.pageId !== editor.getCurrentPageId()) {
		editor.markHistoryStoppingPoint('change-page')
		editor.setCurrentPage(thread.pageId as any)
	}

	const point = anchorPagePoint(editor, thread.anchor)
	if (!point) return

	// With clustering off the pin always renders individually, so skip the zoom-to-split (its cluster
	// badge never exists) and just center on the pin.
	if (options.enableClustering) {
		const parentEvent = findDirectParentEvent(table, thread.id)
		if (
			parentEvent &&
			Number.isFinite(parentEvent.zSplit) &&
			parentEvent.zSplit <= zoomBounds.maxZoom
		) {
			centerOnPointAtZoom(editor, point, splitZoom(parentEvent, zoomBounds), duration)
			return
		}
	}

	const offset = commentCenterScreenOffset(editor) / editor.getZoomLevel()
	editor.centerOnPoint({ x: point.x + offset, y: point.y }, { animation: { duration } })
}

/**
 * Zoom to just past the zoom at which a cluster first unclusters, centered on its centroid. The
 * event that created a visible cluster is the event that splits it, and has the smallest zSplit of
 * everything applied inside it — so its zSplit is exactly the first split within those comments.
 * The animated zoom drives the runtime cursor like any manual zoom. A no-op with no split event.
 */
export function zoomToClusterSplit(
	editor: Editor,
	table: ClusterTable,
	zoomBounds: ClusterZoomBounds,
	node: ClusterNode
) {
	const event = table.events.find((e) => e.result.id === node.id)
	if (!event || !Number.isFinite(event.zSplit)) return
	centerOnPointAtZoom(editor, node.centroid, splitZoom(event, zoomBounds), CLUSTER_EXPAND_ZOOM_MS)
}

/** The zoom to land on to see a merge event's cluster just after it splits. */
function splitZoom(event: MergeEvent, zoomBounds: ClusterZoomBounds): number {
	return clamp(event.zSplit * CLUSTER_SPLIT_ZOOM_FACTOR, zoomBounds.minZoom, zoomBounds.maxZoom)
}

function findDirectParentEvent(table: ClusterTable, threadId: string): MergeEvent | undefined {
	return table.events.find((event) => event.children.some((child) => child.id === threadId))
}

function centerOnPointAtZoom(
	editor: Editor,
	point: { x: number; y: number },
	zoom: number,
	duration = 200
) {
	const viewport = editor.getViewportScreenBounds()
	// The open sidebar shifts the target left so the pin lands mid-uncovered-area, not under it.
	const offset = commentCenterScreenOffset(editor)
	editor.setCamera(
		{
			x: (viewport.w / 2 - offset) / zoom - point.x,
			y: viewport.h / (2 * zoom) - point.y,
			z: zoom,
		},
		{ animation: { duration } }
	)
}
