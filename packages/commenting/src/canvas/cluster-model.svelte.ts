import { untrack } from 'svelte'
import {
	atom,
	computed,
	fromSignal,
	react,
	unsafe__withoutCapture,
	type Editor,
	type TLCommentThread,
} from 'svelte-draw'
import { computeClusterTable } from '../clustering/computeClusterTable'
import { createClusterRuntime } from '../clustering/runtime'
import type { ClusterNode } from '../clustering/types'
import { createFadeVisibleNodes } from './cluster-fade.svelte'
import {
	clusterInputEqual,
	clusterInputIdsEqual,
	collectClusterLeaves,
	type ClusterInput,
} from './cluster-input'
import {
	anyFoldedLeafMoved,
	EMPTY_SET,
	findMovedClusteredLeafIds,
	getClusterZoomBounds,
	isShapeDragInProgress,
	reactOnZoomOut,
	type ClusterModel,
	type ClusterZoomBounds,
} from './cluster-model'
import { openThreadId } from './state'

/**
 * The clustering state machine behind the comments layer. Replaces `useClusterModel`.
 *
 * The core invariant: the only thing that re-flows clustering doc-wide is zoom. Every rebuild is
 * computed immediately as `latestModel`, but the on-screen partition is `renderedModel`, which only
 * changes via (a) the cursor walking on zoom, (b) adoption of the pending rebuild on zoom-out, or
 * (c) LOCAL detach patches, where a leaf that left the input is detached from its own badge in
 * place and nothing else on the canvas moves.
 *
 * Threads the displayed partition can't represent are returned separately (`orphanThreads`,
 * `heldThreads`) for the layer to draw as ordinary pins.
 *
 * The React original did its state transitions while rendering (`setState` during render, which
 * re-renders at once). Here the same transitions run in a `react` reactor over atoms, which re-runs
 * synchronously after each of its own writes — the equivalent loop — and the render-time reads
 * become computeds that Svelte reads through `fromSignal`. Call during component initialisation.
 */
export function createClusterModel(editor: Editor, getThreads: () => readonly TLCommentThread[]) {
	// The Svelte-side input, mirrored into a signal so the computeds below track it the way the
	// React `useValue` deps did.
	const threadsA = atom<readonly TLCommentThread[]>('comment cluster threads', untrack(getThreads))
	$effect.pre(() => {
		threadsA.set(getThreads())
	})

	// Threads held out of clustering because their anchor moved while folded inside a badge
	// (drag, nudge, align, undo, a collaborator — detected by position, not gesture). They render
	// as live pins riding their anchor and rejoin clustering on the next zoom-out.
	const heldA = atom<ReadonlySet<string>>('comment cluster held threads', EMPTY_SET)
	let adoptOnRebuild = false
	// This input's identity keys the O(N²) table rebuild below, so it's gated on value equality: a
	// reply, a reaction, a resolve — anything that touches comment records without moving a pin —
	// returns the previous input and rebuilds nothing.
	//
	// Mid-drag the gate ignores positions too — except a folded leaf's, which a badge can't
	// follow. Its first move passes through, the pop-out below holds the pin out as a live pin,
	// and the input is static again for the rest of the drag.
	let clusterInputRef: ClusterInput = { leaves: [], screenOffsets: undefined }
	let renderedModelRef: ClusterModel | null = null

	const inputC = computed('comment cluster leaves', () => {
		const held = heldA.get()
		const next = collectClusterLeaves(
			editor,
			threadsA.get().filter((thread) => !held.has(thread.id)),
			openThreadId.get(editor)
		)
		const prev = clusterInputRef
		if (
			isShapeDragInProgress(editor) &&
			clusterInputIdsEqual(prev, next) &&
			!anyFoldedLeafMoved(prev, next, renderedModelRef)
		) {
			return prev
		}
		if (clusterInputEqual(prev, next)) return prev
		clusterInputRef = next
		return next
	})
	const boundsC = computed<ClusterZoomBounds>('comment cluster zoom bounds', () =>
		getClusterZoomBounds(editor)
	)
	const latestC = computed<ClusterModel>('comment cluster latest model', () => {
		const clusterInput = inputC.get()
		const bounds = boundsC.get()
		const table = computeClusterTable(clusterInput.leaves, bounds, clusterInput.screenOffsets)
		const runtime = createClusterRuntime(table)
		// The zoom is read untracked: a camera move walks the runtime, it never rebuilds the table.
		unsafe__withoutCapture(() => runtime.seed(editor.getZoomLevel()))
		return { runtime, table }
	})
	// A page switch replaces the whole scene: hard-reset rather than detach the world.
	const pageIdC = computed('comment cluster page', () => editor.getCurrentPageId())

	const initialModel = latestC.get()
	const renderedA = atom<ClusterModel>('comment cluster rendered model', initialModel)
	let pageRef = pageIdC.get()
	renderedModelRef = initialModel

	/** The render-phase state transitions, run until stable. See the function docs. */
	function settle() {
		const pageId = pageIdC.get()
		const latestModel = latestC.get()
		const renderedModel = renderedA.get()
		const heldThreadIds = heldA.get()
		const zoom = () => unsafe__withoutCapture(() => editor.getZoomLevel())
		let clusterModel = renderedModel
		if (pageRef !== pageId) {
			pageRef = pageId
			adoptOnRebuild = false
			latestModel.runtime.seed(zoom())
			if (heldThreadIds.size > 0) heldA.set(EMPTY_SET)
			renderedA.set(latestModel)
			clusterModel = latestModel
		}
		// adoptOnRebuild is set outside the transition pass, paired with clearing heldThreadIds. Only
		// trust it once that pairing is visible here, or an unrelated pass can land in the gap.
		const rejoinPending = heldThreadIds.size === 0 && adoptOnRebuild
		if (renderedModel !== latestModel && rejoinPending) {
			adoptOnRebuild = false
			// Carryover seed: band events inherit the outgoing partition's merged/unmerged state, so
			// nothing changes state because of the swap alone. Idempotent, so safe to re-run.
			latestModel.runtime.seedFrom(zoom(), renderedModel.runtime.getVisible())
			renderedA.set(latestModel)
			clusterModel = latestModel
		} else if (heldThreadIds.size === 0 && renderedModel === latestModel) {
			// Nothing pending and nothing to adopt: clear any leftover force-adopt intent so it can't
			// survive to force-adopt a later, unrelated rebuild.
			adoptOnRebuild = false
		}
		// For the input gate above: folded-vs-visible is judged against what's on screen.
		renderedModelRef = clusterModel
		// Pop-out detection: a leaf folded inside a badge can't follow its anchor (the badge position
		// is baked into the model), so when its live position drifts from the baked one, hold it out.
		// It renders as a live pin riding the anchor; the detach loop below shrinks its badge locally.
		const newlyMovedIds = findMovedClusteredLeafIds(clusterModel, latestModel)
		if (newlyMovedIds.length > 0) {
			const next = new Set(heldThreadIds)
			for (const id of newlyMovedIds) next.add(id)
			heldA.set(next)
		}
	}
	$effect(() => react('comment cluster settle', settle))

	const latestLeafIdsC = computed(
		'comment cluster latest leaf ids',
		() => new Set(latestC.get().table.leaves.map((leaf) => leaf.id))
	)

	// Subscribe to the runtime's partition version, not the raw zoom, so this only re-evaluates on
	// cluster changes rather than every camera frame. The view re-reads the version inline because
	// its detaches bump it after this computed already evaluated.
	const versionC = computed('comment cluster version', () => {
		const clusterModel = renderedA.get()
		clusterModel.runtime.onCamera(editor.getZoomLevel())
		return clusterModel.runtime.version
	})

	// Identity-stable results while their inputs are unchanged (the old `useMemo`s), so the fade and
	// the keyed pin lists only churn when something really changed.
	let orphanCache: { key: unknown[]; value: TLCommentThread[] } | null = null
	let heldCache: { key: unknown[]; value: TLCommentThread[] } | null = null
	let nodesCache: { model: ClusterModel; version: number; value: ClusterNode[] } | null = null
	const memo = <T>(
		cache: { key: unknown[]; value: T } | null,
		key: unknown[],
		compute: () => T
	): { key: unknown[]; value: T } =>
		cache && cache.key.length === key.length && cache.key.every((k, i) => k === key[i])
			? cache
			: { key, value: compute() }

	const viewC = computed('comment cluster view', () => {
		const clusterModel = renderedA.get()
		const latestModel = latestC.get()
		const threads = threadsA.get()
		const heldThreadIds = heldA.get()
		const openId = openThreadId.get(editor)
		const latestLeafIds = latestLeafIdsC.get()
		versionC.get()
		// Local partition maintenance — the only non-zoom visual change. Any displayed leaf that has left the
		// cluster input is detached from its badge in place; the corrected rebuild already sits in latestModel
		// awaiting the next zoom-out. When the two models match, the leaf sets are identical, so skip the scan.
		if (clusterModel !== latestModel) {
			const removedLeafIds: string[] = []
			for (const leaf of clusterModel.table.leaves) {
				if (!latestLeafIds.has(leaf.id)) {
					removedLeafIds.push(leaf.id)
				}
			}
			// Batched: one patch rebuild and one version bump for the whole set.
			if (removedLeafIds.length > 0) clusterModel.runtime.detachLeaves(removedLeafIds)
		}
		// Threads the displayed partition doesn't show anywhere (new comments, reopened threads, undone
		// deletions) render as plain pins until the next zoom-out folds them in. Judged against the
		// displayed partition, so a detached-then-restored leaf reappears.
		// The runtime mutates its partition in place; the version is its change stamp.
		const partitionVersion = clusterModel.runtime.version
		orphanCache = memo(
			orphanCache,
			[clusterModel, latestModel, latestLeafIds, threads, partitionVersion],
			() => {
				if (clusterModel === latestModel) return []
				const displayed = new Set<string>()
				for (const node of clusterModel.runtime.getVisible().values()) {
					for (const member of node.members) displayed.add(member)
				}
				return threads.filter((thread) => latestLeafIds.has(thread.id) && !displayed.has(thread.id))
			}
		)
		heldCache = memo(heldCache, [threads, heldThreadIds, openId], () =>
			threads.filter((thread) => heldThreadIds.has(thread.id) && thread.id !== openId)
		)
		if (
			!nodesCache ||
			nodesCache.model !== clusterModel ||
			nodesCache.version !== partitionVersion
		) {
			nodesCache = {
				model: clusterModel,
				version: partitionVersion,
				value: Array.from(clusterModel.runtime.getVisible().values()),
			}
		}
		return {
			model: clusterModel,
			zoomBounds: boundsC.get(),
			orphanThreads: orphanCache.value,
			heldThreads: heldCache.value,
			visibleNodes: nodesCache.value,
		}
	})
	const view = fromSignal(viewC)
	const held = fromSignal(heldA)
	const rendered = fromSignal(renderedA)
	const latest = fromSignal(latestC)

	// Moved pins rejoin clustering on the next zoom-out motion: clear the set (so the rebuild
	// includes them again) and adopt that rebuild immediately instead of deferring it. Zooming in
	// never folds pins into clusters — merging is a zoom-out-only move, matching the runtime.
	$effect(() => {
		if (held.current.size === 0) return
		return reactOnZoomOut(editor, 'rejoin moved comment pins on zoom out', () => {
			adoptOnRebuild = true
			heldA.set(EMPTY_SET)
		})
	})
	// Adopt a pending rebuild only on zoom-out motion: folding deferred additions into clusters is
	// a merge, and merging only happens while zooming out. While zooming in, the stale table still
	// splits correctly on its own (split thresholds are direction-safe by the hysteresis invariant).
	$effect(() => {
		const clusterModel = rendered.current
		const latestModel = latest.current
		if (clusterModel === latestModel) return
		return reactOnZoomOut(editor, 'adopt pending cluster model on zoom out', (zoom) => {
			latestModel.runtime.seedFrom(zoom, clusterModel.runtime.getVisible())
			renderedA.set(latestModel)
		})
	})

	const fade = createFadeVisibleNodes(
		() => view.current.visibleNodes,
		() => view.current.model
	)

	return {
		/** The partition actually on screen. It can lag the input; see the docs above. */
		get model() {
			return view.current.model
		},
		get zoomBounds() {
			return view.current.zoomBounds
		},
		/** The displayed nodes, each tagged with its cross-fade phase. */
		get fadeNodes() {
			return fade.current
		},
		/** Threads in the input that the displayed partition doesn't show — render them as plain pins. */
		get orphanThreads() {
			return view.current.orphanThreads
		},
		/** Threads held out of clustering because their anchor moved while folded into a badge. */
		get heldThreads() {
			return view.current.heldThreads
		},
	}
}
