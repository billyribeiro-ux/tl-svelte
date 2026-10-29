<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsUnknownAuthor: { id: 'comments.unknown-author', defaultMessage: 'Someone' },
		commentsPinLabel: { id: 'comments.pin-label', defaultMessage: 'Comment by {name}' },
		commentsPinLabelResolved: {
			id: 'comments.pin-label-resolved',
			defaultMessage: 'Resolved comment by {name}',
		},
	})

	/** The opened popover has a header row the hover preview lacks, so it opens this much higher — the
	 *  first comment then lands where the preview's sat. Re-measure if the header height or the preview
	 *  panel padding changes. */
	const THREAD_HEADER_BLOCK = 36
</script>

<script lang="ts">
	import { Avatar } from '@svelte-draw/mentions'
	import {
		getContainer,
		getTranslation,
		usePassThroughWheelEvents,
		type BoxModel,
		type Editor,
		type TLCommentThread,
	} from 'svelte-draw'
	import CommentPin from '../ui/CommentPin.svelte'
	import { forwardPointerEventToCanvas, isCanvasPanGesture } from './canvas-events'
	import { commitCommentMutation } from './comment-mutations'
	import { UNKNOWN_COMMENT_AUTHOR } from './comment-render'
	import type { CommentingContext } from './context'
	import { createThreadComments } from './hooks.svelte'
	import { getCommentingOptions } from './options'
	import { createCanComment, getContextCommentingOptions } from './options.svelte'
	import { fromComputedWith } from './reactive.svelte'
	import { REGION_CORNERS, REGION_HANDLE_MARGIN_PX } from './region-box'
	import RegionBox from './RegionBox.svelte'
	import RegionResizeHandles from './RegionResizeHandles.svelte'
	import { openThreadId } from './state'
	import ThreadPopover from './ThreadPopover.svelte'
	import ThreadPreview from './ThreadPreview.svelte'
	import { createMarkerPreview } from './thread-preview.svelte'
	import {
		anchorPagePoint,
		anchorViewportPoint,
		commentTargetShapeAt,
		impreciseShapePinInset,
		isBoxInInflatedViewport,
		isInInflatedViewport,
		REGION_PIN_CORNER,
		regionAnchorPinCorner,
		regionPinPoint,
		regionWithPinAt,
		shapeAnchorAt,
	} from './thread-state'
	import { POPOVER_OFFSET } from './thread-view'
	import ThreadView from './ThreadView.svelte'

	/**
	 * A single thread's pin: the marker at its anchor, the thread popover when it's open, the hover
	 * preview, and — for a region anchor — the dashed box and its resize handles. Dragging the marker
	 * re-anchors the thread.
	 *
	 * Camera tracking works through signals: the pin subscribes to its own viewport position, so it
	 * updates per camera frame without the layer re-rendering. (The React original was memoized so a
	 * parent re-render skipped it; Svelte's fine-grained updates need no such wrapper.)
	 */
	let {
		editor,
		thread,
		...props
	}: CommentingContext & {
		editor: Editor
		thread: TLCommentThread
	} = $props()

	const options = getContextCommentingOptions()
	const canComment = createCanComment(() => props.currentUserId)
	const container = getContainer()
	const msg = getTranslation()
	// The editor for a mounted pin never changes.
	// svelte-ignore state_referenced_locally
	const comments = createThreadComments(editor, () => thread.id)
	// Only one thread's popover is open at a time — shared across pins via the atom.
	const open = fromComputedWith(
		'thread open',
		() => thread.id,
		(id) => openThreadId.get(editor) === id
	)
	// While dragging the marker, its page point overrides the anchor's; committed on drop.
	let dragPagePoint = $state.raw<{ x: number; y: number } | null>(null)
	let resizeBounds = $state.raw<BoxModel | null>(null)
	// Hovering the marker previews the thread's opening comment, on the delay every marker uses.
	// The editor for a mounted pin never changes.
	// svelte-ignore state_referenced_locally
	const preview = createMarkerPreview(editor, () => `pin:${thread.id}`)
	const previewThreads = $derived([thread])
	// The 'pointer' reveal mode: is the pointer within the region's bounds (plus a grab margin)?
	// Driven by pointer position, not DOM hover, so moving from anywhere in the region out to a corner
	// handle never loses the affordance — the box stays `pointer-events: none`.
	const pointerInRegion = fromComputedWith(
		'pointer in region',
		() => ({ anchor: thread.anchor, pageId: thread.pageId }),
		({ anchor, pageId }) => {
			if (anchor.type !== 'region' || pageId !== editor.getCurrentPageId()) return false
			const m = REGION_HANDLE_MARGIN_PX / editor.getZoomLevel()
			const p = editor.inputs.getCurrentPagePoint()
			return (
				p.x >= anchor.x - m &&
				p.x <= anchor.x + anchor.w + m &&
				p.y >= anchor.y - m &&
				p.y <= anchor.y + anchor.h + m
			)
		}
	)
	// A region's box and handles are revealed while open, mid-resize, or while the pointer is
	// within the region.
	const revealed = $derived(open.current || resizeBounds != null || pointerInRegion.current)
	// A region thread's pin corner is its own (the corner its creating drag released on), with
	// the default as the fallback for older records.
	const pinCorner = $derived(
		thread.anchor.type === 'region' ? regionAnchorPinCorner(thread.anchor) : REGION_PIN_CORNER
	)
	// A region resizes from its corners — every corner but the pin's own, which the pin owns.
	const resizeHandles = $derived(
		REGION_CORNERS.filter((c) => c.x !== pinCorner.x || c.y !== pinCorner.y)
	)
	let dragRef: {
		startX: number
		startY: number
		moved: boolean
		// The anchor's page-space offset from the grab point, so a drag translates the pin by the
		// cursor's delta (like RegionBox's move) instead of snapping the anchor to the cursor.
		offsetX: number
		offsetY: number
	} | null = null
	let markerEl = $state.raw<HTMLButtonElement | null>(null)
	// Wheel pass-through sits on the marker (which is never scrollable), not the layer root —
	// see the note on the layer.
	const passThroughWheelEvents = usePassThroughWheelEvents()

	// The drop-target hint is editor-global state with no automatic reset. If the pin unmounts
	// mid-drag (e.g. Shift+C hides comments), no pointer event will ever reach the drag handlers —
	// clear the hint here or it stays on the shape indefinitely.
	$effect(() => {
		return () => {
			if (dragRef) editor.setHintingShapes([])
		}
	})

	// Clicking outside the open popover closes the thread. Capture phase + a class check rather than
	// stopPropagation, since the popover portals elsewhere in the DOM. The marker is excluded so its own
	// click-to-toggle handles it instead of this closing and the toggle reopening.
	$effect(() => {
		if (!open.current) return
		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as HTMLElement | null
			if (!target) return
			if (target.closest('.tlui-cmt-canvas-popover')) return
			const marker = markerEl
			if (marker && marker.contains(target)) return
			// A press on a region's resize handle edits this thread — don't dismiss it.
			if (target.closest('.tlui-cmt-canvas-region-handle')) return
			// A click inside a menu/popover layered above us (the sidebar's filter or overflow
			// dropdown, or the composer's mention picker — all portaled elsewhere) belongs to that
			// layer; defer to its own dismissal instead of closing the thread out from under it.
			if (
				target.closest('.tlui-menu, [data-radix-popper-content-wrapper], .tlui-cmt-mention-popup')
			)
				return
			openThreadId.set(editor, null)
		}
		document.addEventListener('pointerdown', onPointerDown, true)
		return () => document.removeEventListener('pointerdown', onPointerDown, true)
	})

	// The pin must not unmount mid-interaction: an open thread's popover hangs off it, and a drag
	// or resize holds pointer capture on it — so those states are exempt from the viewport cull.
	const exemptFromCull = $derived(open.current || dragPagePoint != null || resizeBounds != null)
	const point = fromComputedWith(
		'pin point',
		() => ({ anchor: thread.anchor, pageId: thread.pageId, exemptFromCull }),
		({ anchor, pageId, exemptFromCull: exempt }) => {
			if (pageId !== editor.getCurrentPageId()) return null
			const point = anchorViewportPoint(editor, anchor)
			if (!point) return null
			// Off-screen pins (plus a pre-mount margin) unmount rather than re-render every camera frame. A
			// region thread stays mounted while any part of its box is on screen, since the box renders here too.
			if (!exempt) {
				const visible =
					anchor.type === 'region'
						? isBoxInInflatedViewport(editor, anchor)
						: isInInflatedViewport(editor, point)
				if (!visible) return null
			}
			return point
		}
	)

	const toggleOpen = () =>
		openThreadId.set(editor, openThreadId.get(editor) === thread.id ? null : thread.id)

	const threadAuthor = $derived(props.resolveAuthor(thread.createdBy))
	const PinContent = options.components.PinContent
	const pinLabel = $derived(
		msg(thread.resolved ? messages.commentsPinLabelResolved : messages.commentsPinLabel, {
			name: threadAuthor?.name ?? msg(messages.commentsUnknownAuthor),
		})
	)

	// Drag the marker to move the thread: position is overridden locally while dragging, then re-anchored
	// on drop. A region translates keeping its size; a barely-moved pointer is a click.
	const isRegion = $derived(thread.anchor.type === 'region')
	type MarkerPointerEvent = PointerEvent & { currentTarget: EventTarget & HTMLButtonElement }
	// The marker is a button (so it's keyboard-reachable), so the drag handlers are typed to it.
	function startDrag(e: MarkerPointerEvent) {
		// A middle/right-button or space-held press over a pin is a camera pan, not a pin drag —
		// hand it to the canvas untouched.
		if (isCanvasPanGesture(editor, e)) {
			forwardPointerEventToCanvas(container, e)
			return
		}
		e.stopPropagation()
		const grabPage = editor.screenToPage({ x: e.clientX, y: e.clientY })
		const anchorPage = anchorPagePoint(editor, thread.anchor)
		// The drag delta is taken from where the pin is drawn, which for an imprecise shape pin
		// is inset from its anchor point — without this the pin jumps by the inset on drag start.
		const inset = impreciseShapePinInset(editor, thread.anchor)
		if (anchorPage && inset) {
			const zoom = editor.getZoomLevel()
			anchorPage.x += inset.x / zoom
			anchorPage.y += inset.y / zoom
		}
		dragRef = {
			startX: e.clientX,
			startY: e.clientY,
			moved: false,
			offsetX: anchorPage ? anchorPage.x - grabPage.x : 0,
			offsetY: anchorPage ? anchorPage.y - grabPage.y : 0,
		}
		e.currentTarget.setPointerCapture(e.pointerId)
	}
	function onDrag(e: MarkerPointerEvent) {
		const drag = dragRef
		if (!drag) return
		// Moving a pin re-anchors the thread record — a commenting write. Without the permission the
		// press stays a click (`moved` never sets, so release toggles the popover and never commits).
		if (!canComment.current) return
		if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 4) return
		drag.moved = true
		const cursorPage = editor.screenToPage({ x: e.clientX, y: e.clientY })
		const pagePoint = { x: cursorPage.x + drag.offsetX, y: cursorPage.y + drag.offsetY }
		dragPagePoint = pagePoint
		// Hint the shape the pin would re-anchor to on drop — the same hit-test endDrag resolves
		// with. Regions translate rather than re-anchor, so they never hint.
		if (!isRegion) {
			const hit = commentTargetShapeAt(editor, pagePoint)
			editor.setHintingShapes(hit ? [hit.id] : [])
		}
	}
	// Release capture and take the drag record; null when no drag was in progress.
	function takeDrag(e: MarkerPointerEvent) {
		const drag = dragRef
		dragRef = null
		if (e.currentTarget.hasPointerCapture(e.pointerId)) {
			e.currentTarget.releasePointerCapture(e.pointerId)
		}
		return drag
	}
	// A cancelled pointer (touch gesture takeover, browser interruption) aborts the drag outright:
	// no re-anchor commit, no click-toggle — the pin snaps back and the hint clears.
	function cancelDrag(e: MarkerPointerEvent) {
		if (!takeDrag(e)) return
		dragPagePoint = null
		editor.setHintingShapes([])
	}
	function endDrag(e: MarkerPointerEvent) {
		const drag = takeDrag(e)
		if (!drag) return
		editor.setHintingShapes([])
		if (!drag.moved) {
			toggleOpen()
			return
		}
		const cursorPage = editor.screenToPage({ x: e.clientX, y: e.clientY })
		const pagePoint = { x: cursorPage.x + drag.offsetX, y: cursorPage.y + drag.offsetY }
		dragPagePoint = null
		let anchor: TLCommentThread['anchor']
		if (thread.anchor.type === 'region') {
			anchor = regionWithPinAt(thread.anchor, pinCorner, pagePoint)
		} else {
			const hit = commentTargetShapeAt(editor, pagePoint)
			anchor = hit
				? shapeAnchorAt(
						editor,
						hit.id,
						pagePoint,
						getCommentingOptions(editor).shouldBePrecise(editor, {
							shapeId: hit.id,
							point: pagePoint,
							altKey: e.altKey,
						})
					)
				: { type: 'point', x: pagePoint.x, y: pagePoint.y }
		}
		commitCommentMutation(editor, ({ put }) => put([{ ...thread, anchor }]), 'drag')
	}

	// The pin (and its popover) track the live edit: a resize moves it to the region's pin corner, a
	// move to the drag point; otherwise it sits at the stored anchor's viewport point.
	const livePinPage = $derived(
		resizeBounds ? regionPinPoint(resizeBounds, pinCorner) : dragPagePoint
	)
	const renderPointBase = fromComputedWith(
		'pin render point',
		() => ({ live: livePinPage, point: point.current }),
		({ live, point: stored }) => (live ? editor.pageToViewport(live) : stored)
	)
	// A region's pin centres on its corner — overlapping the box — rather than hanging off it.
	// The marker anchors bottom-left, so step half its 28px size (--tlui-cmt-pin-size) left and
	// down (screen px), matching the draft composer's --region centring on the same corner.
	const renderPoint = $derived.by(() => {
		const base = renderPointBase.current
		if (!base) return null
		return isRegion ? { x: base.x - 14, y: base.y + 14 } : base
	})

	// A region's live box bounds, by priority: a corner resize, else a pin-drag translation (the pin
	// corner tracks the cursor), else the stored anchor. Undefined for non-region threads.
	const regionAnchor = $derived(thread.anchor.type === 'region' ? thread.anchor : undefined)
	const movedRegion = $derived(
		regionAnchor && dragPagePoint
			? regionWithPinAt(regionAnchor, pinCorner, dragPagePoint)
			: regionAnchor
	)
	const regionBoxBounds = $derived(resizeBounds ?? movedRegion)
	function commitResize(bounds: BoxModel) {
		resizeBounds = null
		if (!canComment.current) return
		// Same commit path as a pin drag, so the configured `dragHistory` governs both — going
		// straight to `editor.run` here would make region resizes silently ignore the option.
		commitCommentMutation(
			editor,
			// Spread the existing anchor first so the region's pin corner survives a resize.
			({ put }) => put([{ ...thread, anchor: { ...regionAnchor!, ...bounds } }]),
			'drag'
		)
	}
</script>

{#snippet pinContent()}
	{#if PinContent}
		<PinContent {thread} comments={comments.current} />
	{:else}
		<Avatar author={threadAuthor ?? UNKNOWN_COMMENT_AUTHOR} />
	{/if}
{/snippet}

{#if point.current && renderPoint}
	{#if regionBoxBounds && (dragPagePoint || revealed)}
		<RegionBox {editor} box={regionBoxBounds} />
	{/if}
	{#if regionBoxBounds && revealed && !dragPagePoint && canComment.current}
		<RegionResizeHandles
			{editor}
			box={regionBoxBounds}
			handles={resizeHandles}
			onPreview={(bounds) => (resizeBounds = bounds)}
			onCommit={commitResize}
		/>
	{/if}
	<div
		class={[
			'tlui-cmt-canvas-pin',
			open.current && 'tlui-cmt-canvas-pin--open',
			!!dragPagePoint && 'tlui-cmt-canvas-pin--dragging',
		]}
		style:left="{renderPoint.x}px"
		style:top="{renderPoint.y}px"
	>
		<button
			bind:this={markerEl}
			type="button"
			class="tlui-cmt-button tlui-cmt-canvas-pin__marker"
			aria-label={pinLabel}
			aria-expanded={open.current}
			onpointerdown={startDrag}
			onpointermove={onDrag}
			onpointerup={endDrag}
			onpointercancel={cancelDrag}
			onclick={(e) => {
				// Pointer activation is already handled by endDrag (which distinguishes a click
				// from a drag), so only take keyboard-synthesised clicks here — those report
				// `detail === 0` — or the thread would toggle twice per mouse click.
				if (e.detail === 0) toggleOpen()
			}}
			onpointerenter={preview.previewHandlers.onPointerEnter}
			onpointerleave={preview.previewHandlers.onPointerLeave}
			onfocus={preview.previewHandlers.onPointerEnter}
			onblur={preview.previewHandlers.onPointerLeave}
			{@attach passThroughWheelEvents}
		>
			<CommentPin resolved={thread.resolved != null} open={open.current}>
				{@render pinContent()}
			</CommentPin>
		</button>
		<!-- The popover portals up to the menus layer (above the UI panels) so it isn't clipped;
		     the pin itself stays in the canvas-in-front layer, beneath the UI. -->
		{#if open.current}
			<ThreadPopover
				base={{
					x: renderPoint.x + POPOVER_OFFSET.thread.x,
					y: renderPoint.y + POPOVER_OFFSET.thread.y - THREAD_HEADER_BLOCK,
				}}
			>
				<ThreadView {editor} {thread} {...props} />
			</ThreadPopover>
		{/if}
		<!-- Not while dragging: the pin is being moved, not read, and a panel trailing the
		     cursor would obscure the drop target. -->
		{#if preview.previewShown && !dragPagePoint}
			<ThreadPreview
				{editor}
				threads={previewThreads}
				variant="thread"
				point={renderPoint}
				onSelectThread={() => openThreadId.set(editor, thread.id)}
				onPointerEnter={preview.previewHandlers.onPointerEnter}
				onPointerLeave={preview.previewHandlers.onPointerLeave}
				currentUserId={props.currentUserId}
				resolveAuthor={props.resolveAuthor}
			/>
		{/if}
	</div>
{/if}
