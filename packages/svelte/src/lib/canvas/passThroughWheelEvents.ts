import { preventDefault } from '@svelte-draw/editor'
import type { Attachment } from 'svelte/attachments'
import { getContainer, tryGetEditor } from '../context/editor'

function isScrollableOverflow(overflow: string) {
	return overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay'
}

// An element only consumes a wheel event when it's a real scroll container: its content overflows
// AND its computed overflow is scrollable. Checking scrollHeight/scrollWidth alone is not enough —
// an `overflow: visible` element whose content merely overflows (e.g. a comment pin whose hover
// `transform: scale()` inflates scrollHeight past clientHeight) never scrolls, so the wheel must
// still pass through to the canvas.
function isScrollable(elm: HTMLElement) {
	// Cheap first: if nothing overflows, it can't scroll — skip the getComputedStyle read. This runs
	// per ancestor on every wheel event, so avoid resolving styles for the common (non-overflowing) case.
	const overflowsY = elm.scrollHeight > elm.clientHeight
	const overflowsX = elm.scrollWidth > elm.clientWidth
	if (!overflowsY && !overflowsX) return false

	const style = getComputedStyle(elm)
	return (
		(overflowsY && isScrollableOverflow(style.overflowY)) ||
		(overflowsX && isScrollableOverflow(style.overflowX))
	)
}

// Walk from the wheeled element up to (and including) the pass-through root, looking for a scroll
// container. If one is found, the wheel belongs to it — don't redispatch it to the canvas.
function hasScrollableElement(target: EventTarget | null, root: HTMLElement) {
	if (!(target instanceof Node)) {
		return isScrollable(root)
	}

	let elm: Element | null = target instanceof Element ? target : target.parentElement
	while (elm) {
		if (elm instanceof HTMLElement && isScrollable(elm)) {
			return true
		}
		if (elm === root) return false
		elm = elm.parentElement
	}

	return false
}

/**
 * Creates an attachment that redispatches wheel events over an element to the editor's canvas, so
 * floating UI doesn't swallow zoom/pan. Call during component initialisation (it reads the
 * container and editor from context), then use `{@attach passThrough}`. Replaces
 * `usePassThroughWheelEvents`.
 *
 * Unlike the hook, no re-check "after every render" is needed: an attachment is re-run for each
 * element it is attached to, so a component that unmounts and remounts the element (a comment pin
 * culled while its anchor is off screen, say) gets a fresh listener, and a stable element never
 * stacks listeners.
 *
 * @public
 */
export function usePassThroughWheelEvents(): Attachment<HTMLElement> {
	const container = getContainer()
	const editor = tryGetEditor()

	return (elm) => {
		const onWheel = (e: WheelEvent) => {
			// Only pass through wheel events if the editor is focused
			if (!editor?.getInstanceState().isFocused) return

			if ((e as any).isSpecialRedispatchedEvent) return

			// If the wheel is over a scrollable element, let it scroll instead of redispatching.
			if (hasScrollableElement(e.target, elm)) {
				return
			}

			preventDefault(e)
			const cvs = container.querySelector('.tl-canvas')
			if (!cvs) return
			const newEvent = new WheelEvent('wheel', e as any)
			;(newEvent as any).isSpecialRedispatchedEvent = true
			cvs.dispatchEvent(newEvent)
			// Flag the original too: it keeps bubbling, and an enclosing pass-through root (the
			// navigation panel around the minimap) would otherwise redispatch it a second time.
			;(e as any).isSpecialRedispatchedEvent = true
		}

		elm.addEventListener('wheel', onWheel, { passive: false })
		return () => {
			elm.removeEventListener('wheel', onWheel)
		}
	}
}
