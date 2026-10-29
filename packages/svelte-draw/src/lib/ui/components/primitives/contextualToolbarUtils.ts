import { Box, clamp, Vec, type Editor } from '@svelte-draw/editor'

const MIN_DISTANCE_TO_REPOSITION_SQUARED = 16 ** 2
const TOOLBAR_GAP = 8
const SCREEN_MARGIN = 16
const LEFT_ALIGN_TOOLBAR = false

// For convenience, let's work just with boxes here
/** @internal */
export function rectToBox(rect: DOMRect): Box {
	return new Box(rect.x, rect.y, rect.width, rect.height)
}

export function getToolbarScreenPosition(
	editor: Editor,
	toolbarElm: HTMLElement,
	getSelectionBounds: () => Box | undefined
) {
	const selectionBounds = getSelectionBounds()?.clone()
	if (!selectionBounds) return

	// Offset the selection bounds by the viewport screen bounds (if the editor is scrolled or inset, etc)
	const vsb = editor.getViewportScreenBounds()
	selectionBounds.x -= vsb.x
	selectionBounds.y -= vsb.y

	// If the selection bounds are too far off of the screen, don't show the toolbar
	if (
		selectionBounds.midY < SCREEN_MARGIN ||
		selectionBounds.midY > vsb.h - SCREEN_MARGIN ||
		selectionBounds.midX < SCREEN_MARGIN ||
		selectionBounds.midX > vsb.w - SCREEN_MARGIN
	) {
		return
	}

	// Get the toolbar's screen rect as a box. Do this after we verify that there is at least one selection.
	const toolbarBounds = rectToBox(toolbarElm.getBoundingClientRect())

	// Chance these are NaN? Rare case.
	if (!toolbarBounds.width || !toolbarBounds.height) return

	// Thrashy, only do this if we're showing the toolbar
	// ! this might not be needed, the container never scrolls
	const { scrollLeft, scrollTop } = editor.getContainer()

	// We want to position the toolbar so that it is centered over the selection
	// except in the cases where it would extend off the edge of the screen.

	// Start by placing the top left corner of the toolbar so that the
	// toolbar would be centered above the section bounds, bumped up by the

	let x = LEFT_ALIGN_TOOLBAR ? selectionBounds.x : selectionBounds.midX - toolbarBounds.w / 2
	let y = selectionBounds.y - toolbarBounds.h - TOOLBAR_GAP

	// Clamp the position on screen.
	x = clamp(x, SCREEN_MARGIN, vsb.w - toolbarBounds.w - SCREEN_MARGIN)
	y = clamp(y, SCREEN_MARGIN, vsb.h - toolbarBounds.h - SCREEN_MARGIN)

	// Offset the position by the container's scroll position
	// Round the position to the nearest pixel
	return { x: Math.round(x + scrollLeft), y: Math.round(y + scrollTop) }
}

export function sufficientlyDistant(curr: Vec, next: Vec, changeOnlyWhenYChanges: boolean) {
	const dist2 = changeOnlyWhenYChanges ? (next.y - curr.y) ** 2 : Vec.Dist2(next, curr)
	return dist2 >= MIN_DISTANCE_TO_REPOSITION_SQUARED
}
