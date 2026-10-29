import { untrack } from 'svelte'
import type { ClusterNode } from '../clustering/types'

const CLUSTER_FADE_MS = 150

export type ClusterFadePhase = 'entering' | 'present' | 'exiting'

export interface ClusterFadeNode {
	node: ClusterNode
	phase: ClusterFadePhase
}

/**
 * Cross-fades the visible cluster nodes as the partition changes: a node that appears starts
 * `entering` and flips to `present` on the next frame, and one that leaves is kept as `exiting`
 * until the CSS transition has run. `getResetKey` is compared by identity — a new cluster model
 * replaces the whole world, so its nodes snap to `present` instead of animating.
 *
 * Call during component initialisation; read `.current`. Replaces `useFadeVisibleNodes`.
 */
export function createFadeVisibleNodes(
	getNodes: () => readonly ClusterNode[],
	getResetKey: () => object
): { readonly current: ClusterFadeNode[] } {
	let fadeNodes = $state.raw<ClusterFadeNode[]>(toPresentFadeNodes(untrack(getNodes)))

	// Resets only on a new model (reset key); node-list changes within the same model are handled by
	// the reconcile effect below, which fades entries in/out instead of snapping. Runs before the DOM
	// updates, so a new model never renders a frame of fading.
	$effect.pre(() => {
		void getResetKey()
		const nodes = untrack(getNodes)
		fadeNodes = toPresentFadeNodes(nodes)
	})

	// Declared after the reset effect: when both change together the reset applies first, so the
	// reconcile finds identical sets and nothing animates.
	$effect.pre(() => {
		const nodes = getNodes()
		untrack(() => {
			fadeNodes = reconcileFadeNodes(fadeNodes, nodes)
		})
	})

	const hasEntering = $derived(fadeNodes.some((item) => item.phase === 'entering'))
	$effect(() => {
		if (!hasEntering) return
		const frame = requestAnimationFrame(() => {
			fadeNodes = fadeNodes.map((item) =>
				item.phase === 'entering' ? { ...item, phase: 'present' } : item
			)
		})
		return () => cancelAnimationFrame(frame)
	})

	const hasExiting = $derived(fadeNodes.some((item) => item.phase === 'exiting'))
	$effect(() => {
		if (!hasExiting) return
		const timeout = window.setTimeout(() => {
			fadeNodes = fadeNodes.filter((item) => item.phase !== 'exiting')
		}, CLUSTER_FADE_MS)
		return () => window.clearTimeout(timeout)
	})

	return {
		get current() {
			return fadeNodes
		},
	}
}

function toPresentFadeNodes(nodes: readonly ClusterNode[]): ClusterFadeNode[] {
	return nodes.map((node) => ({ node, phase: 'present' }))
}

function reconcileFadeNodes(
	previous: readonly ClusterFadeNode[],
	nextNodes: readonly ClusterNode[]
): ClusterFadeNode[] {
	const previousById = new Map(previous.map((item) => [item.node.id, item]))
	const nextIds = new Set(nextNodes.map((node) => node.id))
	const next: ClusterFadeNode[] = []

	for (const node of nextNodes) {
		const previousItem = previousById.get(node.id)
		// A node that was fading out and came back snaps to present rather than re-entering.
		next.push({
			node,
			phase: !previousItem
				? 'entering'
				: previousItem.phase === 'exiting'
					? 'present'
					: previousItem.phase,
		})
	}

	for (const item of previous) {
		if (nextIds.has(item.node.id)) continue
		next.push(item.phase === 'exiting' ? item : { ...item, phase: 'exiting' })
	}

	return next
}

export function clusterFadeClassName(phase: ClusterFadePhase): string {
	return `tlui-cmt-cluster-fade tlui-cmt-cluster-fade--${phase}`
}
