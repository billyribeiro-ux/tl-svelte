<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsClusterLabel: {
			id: 'comments.cluster-label',
			defaultMessage: '{count, plural, one {# comment here} other {# comments here}}',
		},
	})
</script>

<script lang="ts">
	import {
		getContainer,
		getTranslation,
		usePassThroughWheelEvents,
		type Editor,
		type TLCommentThread,
	} from 'svelte-draw'
	import type { ClusterNode } from '../clustering/types'
	import CountBadge from '../ui/CountBadge.svelte'
	import { forwardPointerEventToCanvas, isCanvasPanGesture } from './canvas-events'
	import type { CommentingContext } from './context'
	import { fromComputedWith } from './reactive.svelte'
	import ThreadPreview from './ThreadPreview.svelte'
	import { sortThreadsForPreview } from './thread-preview'
	import { createMarkerPreview } from './thread-preview.svelte'
	import { impreciseShapePinInset, isInInflatedViewport } from './thread-state'

	/**
	 * The count badge standing in for several threads folded together at the current zoom. Hovering it
	 * previews its threads as a list; clicking zooms to the zoom level at which the cluster splits.
	 *
	 * Camera tracking works through signals, not props: the badge subscribes to its own viewport
	 * position, so it re-renders per camera frame only for itself. (The React original was memoized so
	 * a parent re-render skipped it; Svelte's fine-grained updates need no such wrapper.)
	 */
	let {
		editor,
		node,
		onExpand,
		onSelectThread,
		threadsById,
		currentUserId,
		resolveAuthor,
	}: Pick<CommentingContext, 'currentUserId' | 'resolveAuthor'> & {
		editor: Editor
		node: ClusterNode
		onExpand(node: ClusterNode): void
		onSelectThread(thread: TLCommentThread): void
		threadsById: ReadonlyMap<string, TLCommentThread>
	} = $props()

	const container = getContainer()
	const msg = getTranslation()
	// The editor for a mounted pin never changes.
	// svelte-ignore state_referenced_locally
	const preview = createMarkerPreview(editor, () => `cluster:${node.id}`)
	// Wheel pass-through sits on the badge (never scrollable), not the layer root — see the
	// note on the layer.
	const passThroughWheelEvents = usePassThroughWheelEvents()
	// The mean of the members' render offsets, in screen px. Imprecise members' pins draw tucked
	// into their shape (see impreciseShapePinInset), and the merge thresholds are priced at those
	// visual positions — so the badge draws at the centroid of the pins as drawn, which (screen
	// mapping being affine) is the anchor centroid plus this mean. Camera-independent: its own
	// computed so the per-frame point below only adds two numbers, and a cluster of precise
	// members tracks nothing and adds zero.
	const meanInset = fromComputedWith(
		'cluster badge inset',
		() => ({ node, threadsById }),
		({ node: n, threadsById: byId }) => {
			let x = 0
			let y = 0
			for (const id of n.members) {
				const thread = byId.get(id)
				if (!thread) continue
				const inset = impreciseShapePinInset(editor, thread.anchor)
				if (inset) {
					x += inset.x
					y += inset.y
				}
			}
			return { x: x / n.count, y: y / n.count }
		}
	)
	const point = fromComputedWith(
		'cluster badge point',
		() => ({ node, meanInset: meanInset.current }),
		({ node: n, meanInset: inset }) => {
			const pagePoint = editor.pageToViewport(n.centroid)
			if (!isInInflatedViewport(editor, pagePoint)) return null
			return { x: pagePoint.x + inset.x, y: pagePoint.y + inset.y }
		}
	)

	// `node.members` is sorted by id (the clustering table's ordering); the preview wants them in
	// the order a reader would expect. Only computed while the preview is up.
	const previewThreads = $derived.by(() => {
		if (!preview.previewShown) return []
		const threads: TLCommentThread[] = []
		for (const id of node.members) {
			const thread = threadsById.get(id)
			if (thread) threads.push(thread)
		}
		return sortThreadsForPreview(threads)
	})

	function onPointerDown(e: PointerEvent) {
		if (isCanvasPanGesture(editor, e)) {
			forwardPointerEventToCanvas(container, e)
			return
		}
		e.stopPropagation()
	}

	function onClick(e: MouseEvent) {
		e.stopPropagation()
		onExpand(node)
	}
</script>

{#if point.current}
	<button
		type="button"
		class="tlui-cmt-button tlui-cmt-canvas-cluster"
		style:left="{point.current.x}px"
		style:top="{point.current.y}px"
		aria-label={msg(messages.commentsClusterLabel, { count: node.count })}
		onpointerdown={onPointerDown}
		onclick={onClick}
		onpointerenter={preview.previewHandlers.onPointerEnter}
		onpointerleave={preview.previewHandlers.onPointerLeave}
		onfocus={preview.previewHandlers.onPointerEnter}
		onblur={preview.previewHandlers.onPointerLeave}
		{@attach passThroughWheelEvents}
	>
		<CountBadge count={node.count} />
	</button>
	{#if preview.previewShown && previewThreads.length > 0}
		<ThreadPreview
			{editor}
			threads={previewThreads}
			variant="list"
			point={point.current}
			{onSelectThread}
			onPointerEnter={preview.previewHandlers.onPointerEnter}
			onPointerLeave={preview.previewHandlers.onPointerLeave}
			{currentUserId}
			{resolveAuthor}
		/>
	{/if}
{/if}
