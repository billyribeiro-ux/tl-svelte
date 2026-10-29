<script lang="ts">
	import { isMentionPickerOpen } from '@svelte-draw/mentions'
	import { untrack } from 'svelte'
	import {
		EditorPortal,
		fromComputed,
		getEditor,
		type TLCommentThread,
	} from 'svelte-draw'
	import type { ClusterNode } from '../clustering/types'
	import { registerCommentAnchorLifecycle } from './anchor-lifecycle'
	import ClusterBadge from './ClusterBadge.svelte'
	import { clusterFadeClassName } from './cluster-fade.svelte'
	import { CLUSTER_EXPAND_ZOOM_MS, revealThreadPin, zoomToClusterSplit } from './cluster-model'
	import { createClusterModel } from './cluster-model.svelte'
	import { getCommentRecord, getCommentThread } from './comment-store'
	import { fadeNodeMarkerThreadId } from './comments-overlay'
	import type { CommentingContext } from './context'
	import { createCommentThreads } from './hooks.svelte'
	import { createCanComment, getContextCommentingOptions } from './options.svelte'
	import PendingComposer from './PendingComposer.svelte'
	import { computePinStacks, isOpenStackKeyLive, pinStacksEqual } from './pin-stacking'
	import { fromComputedWith } from './reactive.svelte'
	import RegionBox from './RegionBox.svelte'
	import RegionDraftBox from './RegionDraftBox.svelte'
	import {
		commentsHidden,
		openStackId,
		openThreadId,
		pendingComment,
		revealThreadRequest,
		sidebarFilters,
		toggleCommentsHidden,
	} from './state'
	import {
		createCommentsHidden,
		createOpenThreadId,
		createPendingComment,
	} from './state.svelte'
	import ThreadPin from './ThreadPin.svelte'
	import ThreadStackPin from './ThreadStackPin.svelte'

	let props: CommentingContext = $props()

	const editor = getEditor()
	const options = getContextCommentingOptions()
	const allThreads = createCommentThreads(editor)
	const pending = createPendingComment()
	const canComment = createCanComment(() => props.currentUserId)
	// Nothing renders a pending comment when composing is blocked and there's no fallback slot, and
	// the dismiss handlers live inside PendingComposer — so clear the atom rather than strand it,
	// and leave the tool too: it holds while a composer is open, so staying would turn every click
	// into a silently swallowed placement.
	const canRenderComposer = $derived(
		canComment.current || options.components.ComposerFallback != null
	)
	const showPendingComposer = $derived(pending.current != null && canRenderComposer)
	$effect(() => {
		if (pending.current && !showPendingComposer) {
			pendingComment.set(editor, null)
			if (editor.isIn('comment')) editor.setCurrentTool('select')
		}
	})
	const openId = createOpenThreadId()
	// Matches the sidebar's `showResolved` filter. The open thread stays in — resolving from its own
	// popover shouldn't make the pin vanish under it.
	const showResolved = fromComputed('show resolved', () => sidebarFilters.get(editor).showResolved)
	const threads = $derived(
		allThreads.current.filter(
			(t) => showResolved.current || t.resolved == null || t.id === openId.current
		)
	)
	$effect(() => registerCommentAnchorLifecycle(editor))
	const cluster = createClusterModel(editor, () => threads)
	const threadsById = $derived(
		new Map<string, TLCommentThread>(threads.map((thread) => [thread.id, thread]))
	)
	// Pins with the *same* anchor point coincide at every zoom, so they render as one count-badge
	// stack. Keyed on page-space anchors, so camera moves never recompute this. Holding the map's
	// identity while the grouping is unchanged keeps a reply from re-rendering every pin — but the
	// map has no positions in it, so anything needing a stack's *point* must read the anchors itself.
	let pinStacksRef: Map<string, readonly string[]> = new Map()
	const pinStacks = fromComputedWith(
		'comment pin stacks',
		() => threads,
		(currentThreads) => {
			const stacks = computePinStacks(editor, currentThreads)
			if (pinStacksEqual(pinStacksRef, stacks)) return pinStacksRef
			pinStacksRef = stacks
			return stacks
		}
	)
	const openThread = $derived(openId.current ? threadsById.get(openId.current) : null)
	const hidden = createCommentsHidden()

	$effect(() => {
		return () => {
			openThreadId.set(editor, null)
			openStackId.set(editor, null)
			pendingComment.set(editor, null)
			revealThreadRequest.set(editor, null)
		}
	})

	// Clear a stale open-stack key: only the stack's own mounted handlers clear it, so collapsing to
	// a single pin strands it — and `createMarkerPreview` reads any non-null value as "a stack is open"
	// and suppresses every hover preview. Kept while any live stack still sits at that key. Reads the
	// anchors rather than keying off `pinStacks`, whose identity survives a stack moving as a whole.
	const openStackKeyIsStale = fromComputedWith(
		'open stack key stale',
		() => ({ stacks: pinStacks.current, byId: threadsById }),
		({ stacks, byId }) => {
			const key = openStackId.get(editor)
			if (!key) return false
			return !isOpenStackKeyLive(editor, key, stacks, byId)
		}
	)
	$effect(() => {
		if (openStackKeyIsStale.current) openStackId.set(editor, null)
	})

	// The requested thread, once it (and, for a comment id, its parent thread) has synced into the
	// store; null while records are still arriving or when no request is pending.
	const requestedRevealThread = fromComputed('requested reveal thread', () => {
		const id = revealThreadRequest.get(editor)
		if (!id) return null
		const record = getCommentRecord(editor, id)
		if (!record) return null
		const thread = record.typeName === 'comment' ? getCommentThread(editor, record.threadId) : record
		return thread?.typeName === 'comment-thread' ? thread : null
	})

	// Bring a thread's pin into view (zooming to the first cluster split that unfolds it if it's
	// folded into a badge) and open it.
	function revealAndOpenThread(thread: TLCommentThread, duration?: number) {
		revealThreadPin(editor, thread, cluster.model.table, cluster.zoomBounds, options, duration)
		openThreadId.set(editor, thread.id)
	}

	// Serve a pending reveal request. Also unhides pins: the popover opens on the layer that hiding
	// withholds.
	$effect(() => {
		const requested = requestedRevealThread.current
		if (!requested) return
		untrack(() => {
			revealThreadRequest.set(editor, null)
			commentsHidden.set(editor, false)
			revealAndOpenThread(requested)
		})
	})

	// Picking a thread out of a cluster's hover preview. `openThreadId` alone would work, but would
	// cut straight there from the badge — zoom in first, the same move the badge's own click makes.
	const revealClusteredThread = (thread: TLCommentThread) =>
		revealAndOpenThread(thread, CLUSTER_EXPAND_ZOOM_MS)

	const expandCluster = (node: ClusterNode) => {
		zoomToClusterSplit(editor, cluster.model.table, cluster.zoomBounds, node)
	}

	// Escape collapses the open thread. Capture-phase so it runs ahead of the editor, which would
	// otherwise cancel the tool or clear the selection.
	$effect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Escape' || openThreadId.get(editor) === null) return
			// The mention picker owns Escape while it's open — let it dismiss the roster alone.
			if (isMentionPickerOpen()) return
			const target = e.target as HTMLElement | null
			if (target && target.closest('.tlui-cmt-editing')) return
			openThreadId.set(editor, null)
			e.preventDefault()
			e.stopPropagation()
		}
		document.addEventListener('keydown', onKeyDown, true)
		return () => document.removeEventListener('keydown', onKeyDown, true)
	})

	// Shift+C toggles pin visibility. Physical `KeyC` so it's layout-independent, and skipped while
	// typing so it never fires from inside a composer.
	$effect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.code !== 'KeyC' || !e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return
			const target = e.target as HTMLElement | null
			if (target && target.closest('input, textarea, [contenteditable="true"]')) return
			toggleCommentsHidden(editor)
			e.preventDefault()
		}
		document.addEventListener('keydown', onKeyDown, true)
		return () => document.removeEventListener('keydown', onKeyDown, true)
	})

	// The node's pin-stack group when every member shares one — a stack standing on its own, which
	// renders as a cascading count-badge list rather than a zoom-to-split cluster badge. The group
	// can include an open or orphan member the node's own leaves omit.
	function stackGroupOf(node: ClusterNode): readonly string[] | null {
		const group = pinStacks.current.get(node.members[0])
		if (!group) return null
		return node.members.every((id) => group.includes(id)) ? group : null
	}

	// Which threads are on screen this render. A stack renders once, owned by its first on-screen
	// member — members arrive by different paths, so ownership can't be decided per-path.
	const renderedThreadIds = $derived.by(() => {
		const ids = new Set<string>()
		if (options.enableClustering) {
			for (const { node } of cluster.fadeNodes) {
				if (node.count === 1) ids.add(node.id)
				// A pure-stack node's members aren't count-1 leaves, so register them here for the owner
				// logic to pick from.
				else if (stackGroupOf(node)) for (const id of node.members) ids.add(id)
			}
			for (const thread of cluster.orphanThreads) ids.add(thread.id)
			for (const thread of cluster.heldThreads) ids.add(thread.id)
		} else {
			for (const thread of threads) ids.add(thread.id)
		}
		if (openThread) ids.add(openThread.id)
		return ids
	})

	function stackThreadsOf(group: readonly string[]): TLCommentThread[] {
		return group
			.map((id) => threadsById.get(id))
			.filter((t): t is TLCommentThread => t !== undefined)
	}
</script>

<!-- A coincident-stack member renders as the group's single count-badge stack (if it owns it)
     or not at all; everything else is an ordinary pin. -->
{#snippet renderThreadPin(thread: TLCommentThread)}
	{@const group = pinStacks.current.get(thread.id)}
	{#if group}
		{#if group.find((id) => renderedThreadIds.has(id)) === thread.id}
			<ThreadStackPin {editor} threads={stackThreadsOf(group)} {...props} />
		{/if}
	{:else}
		<ThreadPin {editor} {thread} {...props} />
	{/if}
{/snippet}

<!-- The signal is read above so this stays mounted and its shortcut/Escape effects keep running. -->
{#if !hidden.current}
	<!-- Portalled rather than rendered into this component's slot: pins sit below the collaborator
	     cursors and popovers above the UI panels, and no single canvas layer spans both. The portal
	     also fixes where the layer lands among the container's children, keeping it behind the UI's
	     skip link in the tab order. -->
	<EditorPortal>
		<!-- Wheel pass-through lives on each interactive element, not this root: the root spans the
		     whole canvas, so a pin past its bottom/right edge inflates scrollHeight and the wheel
		     hook's is-this-scrollable guard silently disables pass-through. -->
		<div class="tlui-cmt-canvas-layer">
			{#if options.enableClustering}
				{#each cluster.fadeNodes as { node, phase } (node.id)}
					{@const stackGroup = node.count > 1 ? stackGroupOf(node) : null}
					{#if node.count === 1}
						{@const markerId = fadeNodeMarkerThreadId(node, null, openId.current)}
						{@const thread = markerId ? threadsById.get(markerId) : undefined}
						{#if thread}
							<div class={clusterFadeClassName(phase)}>
								{@render renderThreadPin(thread)}
							</div>
						{/if}
					{:else if stackGroup}
						<!-- Routed through the stack's owner so the open/orphan/held slots stay deduped:
						     when the owner is one of them, that slot draws the stack and this draws nothing. -->
						{@const owner = stackGroup.find((id) => renderedThreadIds.has(id)) ?? null}
						{@const markerId = fadeNodeMarkerThreadId(node, owner, openId.current)}
						{@const thread = markerId ? threadsById.get(markerId) : undefined}
						<div class={clusterFadeClassName(phase)}>
							{#if thread}{@render renderThreadPin(thread)}{/if}
						</div>
					{:else}
						<div class={clusterFadeClassName(phase)}>
							<ClusterBadge
								{editor}
								{node}
								onExpand={expandCluster}
								onSelectThread={revealClusteredThread}
								{threadsById}
								currentUserId={props.currentUserId}
								resolveAuthor={props.resolveAuthor}
							/>
						</div>
					{/if}
				{/each}
				{#each cluster.orphanThreads as thread (thread.id)}
					{@render renderThreadPin(thread)}
				{/each}
				{#each cluster.heldThreads as thread (thread.id)}
					{@render renderThreadPin(thread)}
				{/each}
			{:else}
				<!-- Clustering off: every thread renders its own pin. The open thread is excluded and
				     rendered once below, or it would mount a second, stacked pin. -->
				{#each threads.filter((thread) => thread.id !== openId.current) as thread (thread.id)}
					{@render renderThreadPin(thread)}
				{/each}
			{/if}
			{#if openThread}
				{#key openThread.id}
					{@render renderThreadPin(openThread)}
				{/key}
			{/if}
			<RegionDraftBox {editor} />
			<!-- Keep the region visible while composing — the drag draft is gone by now, and no thread
			     exists yet, so the pending anchor is what shows the area under the open composer. -->
			{#if pending.current}
				{@const pendingNow = pending.current}
				{#if pendingNow.anchor.type === 'region' && showPendingComposer}
					<RegionBox {editor} box={pendingNow.anchor} />
				{/if}
				{#if showPendingComposer}
					<PendingComposer {editor} pending={pendingNow} {...props} />
				{/if}
			{/if}
		</div>
	</EditorPortal>
{/if}
