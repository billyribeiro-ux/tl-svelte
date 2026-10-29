<script lang="ts" module>
	import { defineMessages } from 'svelte-draw'

	const messages = defineMessages({
		commentsStackLabel: {
			id: 'comments.stack-label',
			defaultMessage:
				'{count, plural, one {# comment at this spot} other {# comments at this spot}}',
		},
	})
</script>

<script lang="ts">
	import {
		fromComputed,
		getTranslation,
		usePassThroughWheelEvents,
		type Editor,
		type TLCommentThread,
	} from 'svelte-draw'
	import CountBadge from '../ui/CountBadge.svelte'
	import type { CommentingContext } from './context'
	import { pinStackKey } from './pin-stacking'
	import { fromComputedWith } from './reactive.svelte'
	import StackThreadCard from './StackThreadCard.svelte'
	import { openStackId, openThreadId } from './state'
	import ThreadPopover from './ThreadPopover.svelte'
	import ThreadPreview from './ThreadPreview.svelte'
	import { createMarkerPreview } from './thread-preview.svelte'
	import { anchorPagePoint, anchorViewportPoint } from './thread-state'
	import { POPOVER_OFFSET } from './thread-view'
	import ThreadView from './ThreadView.svelte'

	/**
	 * The pin for threads whose anchors resolve to the same page point — pins zooming can never
	 * separate, so they share one count badge. Clicking it lists each thread as a card; clicking a card
	 * expands that thread in place, via the single open-thread state.
	 */
	let {
		editor,
		threads,
		...props
	}: CommentingContext & {
		editor: Editor
		/** The stack's threads, oldest first. All resolve to the same anchor point. */
		threads: readonly TLCommentThread[]
	} = $props()

	const msg = getTranslation()
	let badge = $state.raw<HTMLButtonElement | null>(null)
	// The badge takes pointer events (to open on click), so wheel input over it would otherwise be
	// swallowed instead of zooming — pass it through to the canvas, as the pin and cluster badge do.
	const passThroughWheelEvents = usePassThroughWheelEvents()
	// Hovering the badge previews its threads; clicking still opens them as the interactive list.
	// The preview is what makes the badge legible before you commit to opening it.
	// svelte-ignore state_referenced_locally
	const markerPreview = createMarkerPreview(editor, () => `stack:${threads[0].id}`)
	const previewHandlers = markerPreview.previewHandlers
	// The list stays open while a member thread is expanded, so Escape steps back: expanded thread ->
	// card list -> closed. Held in editor state because this pin remounts as its owning render path
	// changes, and keyed by the coincident page point so the open state survives losing a member.
	const stackId = fromComputedWith(
		'stack id',
		() => threads,
		(list) => {
			const pagePoint = anchorPagePoint(editor, list[0].anchor)
			return pagePoint ? pinStackKey(pagePoint) : list[0].id
		}
	)
	const listOpen = fromComputedWith(
		'stack list open',
		() => stackId.current,
		(id) => openStackId.get(editor) === id
	)
	const openId = fromComputed('open thread id', () => openThreadId.get(editor))
	const openMember = $derived(threads.find((thread) => thread.id === openId.current))
	const open = $derived(listOpen.current || openMember !== undefined)

	const point = fromComputedWith(
		'stack point',
		() => threads,
		(list) => {
			const first = list[0]
			if (first.pageId !== editor.getCurrentPageId()) return null
			// The badge hangs off its anchor point bottom-left like a pin, and applies the same imprecise-shape
			// inset the pins it stands in for would (see ThreadPin) — otherwise the marker would snap from tucked
			// inside the shape to the raw corner the moment a second comment turns a pin into a stack.
			return anchorViewportPoint(editor, first.anchor)
		}
	)

	// Clicking outside the popover (and off the badge) closes the whole stack — mirrors the
	// single pin's dismiss. Capture phase + class checks, since the popover portals elsewhere.
	$effect(() => {
		if (!open) return
		const onPointerDown = (e: PointerEvent) => {
			const target = e.target as HTMLElement | null
			if (!target) return
			if (target.closest('.tlui-cmt-canvas-popover')) return
			if (badge && badge.contains(target)) return
			// A click inside a menu/popover layered above us belongs to that layer; defer to its
			// own dismissal instead of closing the stack out from under it.
			if (
				target.closest('.tlui-menu, [data-radix-popper-content-wrapper], .tlui-cmt-mention-popup')
			)
				return
			openStackId.set(editor, null)
			openThreadId.set(editor, null)
		}
		document.addEventListener('pointerdown', onPointerDown, true)
		return () => document.removeEventListener('pointerdown', onPointerDown, true)
	})

	// Escape with only the card list showing closes it. When a member thread is expanded, the
	// layer's Escape handler collapses that first and marks the event consumed — stepping back
	// to the list rather than closing everything at once.
	$effect(() => {
		if (!listOpen.current) return
		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key !== 'Escape' || e.defaultPrevented) return
			openStackId.set(editor, null)
		}
		document.addEventListener('keydown', onKeyDown, true)
		return () => document.removeEventListener('keydown', onKeyDown, true)
	})

	function toggle() {
		if (open) {
			openStackId.set(editor, null)
			openThreadId.set(editor, null)
		} else {
			openStackId.set(editor, stackId.current)
		}
	}

	// The expanded thread gains a header that pushes its first comment down from where the hover preview
	// showed it. When that thread is the list's first, lift the whole list so its "You" holds position
	// across hover -> open. Only the first entry — lifting can't also hold a lower thread's neighbours.
	const liftForHeader = $derived(threads[0].id === openId.current ? 42 : 0)
</script>

{#if point.current}
	{@const pt = point.current}
	<div class="tlui-cmt-canvas-pin" style:left="{pt.x}px" style:top="{pt.y}px">
		<button
			bind:this={badge}
			type="button"
			class="tlui-cmt-button tlui-cmt-canvas-stack-badge"
			aria-label={msg(messages.commentsStackLabel, { count: threads.length })}
			aria-expanded={open}
			onpointerdown={(e) => e.stopPropagation()}
			onclick={(e) => {
				e.stopPropagation()
				toggle()
			}}
			onpointerenter={previewHandlers.onPointerEnter}
			onpointerleave={previewHandlers.onPointerLeave}
			onfocus={previewHandlers.onPointerEnter}
			onblur={previewHandlers.onPointerLeave}
			{@attach passThroughWheelEvents}
		>
			<CountBadge count={threads.length} {open} />
		</button>
	</div>
	{#if markerPreview.previewShown && !open}
		<!-- Lines the preview up with the stack list itself, so opening it leaves the cards
		     exactly where the preview had them. Picking a card from the preview lands in the same
		     place clicking the badge and then the card would: the list open, that thread expanded
		     within it. -->
		<ThreadPreview
			{editor}
			{threads}
			variant="list"
			point={pt}
			onSelectThread={(thread) => {
				openStackId.set(editor, stackId.current)
				openThreadId.set(editor, thread.id)
			}}
			onPointerEnter={previewHandlers.onPointerEnter}
			onPointerLeave={previewHandlers.onPointerLeave}
			currentUserId={props.currentUserId}
			resolveAuthor={props.resolveAuthor}
		/>
	{/if}
	{#if open}
		<ThreadPopover
			base={{
				x: pt.x + POPOVER_OFFSET.list.x,
				y: pt.y + POPOVER_OFFSET.list.y - liftForHeader,
			}}
		>
			<div class="tlui-cmt-stack-list">
				{#each threads as thread (thread.id)}
					{#if thread.id === openId.current}
						<div class="tlui-cmt-stack-list__thread">
							<ThreadView {editor} {thread} {...props} />
						</div>
					{:else}
						<StackThreadCard
							{editor}
							{thread}
							{...props}
							onOpen={() => openThreadId.set(editor, thread.id)}
						/>
					{/if}
				{/each}
			</div>
		</ThreadPopover>
	{/if}
{/if}
