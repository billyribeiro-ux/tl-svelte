import { EditorAtom, fromComputed, type Editor } from 'svelte-draw'
import { openStackId, openThreadId } from './state'
import { PREVIEW_CLOSE_DELAY_MS, PREVIEW_OPEN_DELAY_MS } from './thread-preview'

/**
 * Which marker's preview is showing, or null. One atom for the whole layer, so previews are
 * mutually exclusive: the close delay can leave an outgoing marker's timer pending when the next
 * opens, and per-component state would briefly show both.
 */
const hoveredMarkerId = new EditorAtom<string | null>('commentHoveredMarkerId', () => null)

/**
 * Hover state for one marker. Returns whether its preview should render, plus the pointer handlers
 * to attach to the marker element. `getMarkerId` must be stable and unique per marker across the
 * layer — prefix by kind, or a stack collides with its oldest member's own pin. Call during
 * component initialisation. Replaces `useMarkerPreview`.
 */
export function createMarkerPreview(editor: Editor, getMarkerId: () => string) {
	let openTimer = 0
	let closeTimer = 0

	// Previews are a resting-state affordance. While a thread or stack list is open, that view is
	// the thing being read — a preview floating over it would just compete with it.
	const suppressed = fromComputed(
		'marker preview suppressed',
		() => openThreadId.get(editor) !== null || openStackId.get(editor) !== null
	)
	// Which marker is showing is a signal; whether it is *this* marker follows the id getter.
	const hovered = fromComputed('marker preview hovered', () => hoveredMarkerId.get(editor))

	$effect(() => {
		const markerId = getMarkerId()
		return () => {
			window.clearTimeout(openTimer)
			window.clearTimeout(closeTimer)
			// Don't strand the atom on a marker that has unmounted — zoomed into a cluster, deleted,
			// or folded away — or no other marker's preview could ever show.
			if (hoveredMarkerId.get(editor) === markerId) hoveredMarkerId.set(editor, null)
		}
	})

	// Suppression can start *while* a preview is up: clicking the hovered pin opens its thread.
	// Retract the preview rather than leaving it stranded behind the popover that just opened.
	$effect(() => {
		const markerId = getMarkerId()
		if (suppressed.current && hoveredMarkerId.get(editor) === markerId) {
			hoveredMarkerId.set(editor, null)
		}
	})

	function onPointerEnter() {
		window.clearTimeout(openTimer)
		window.clearTimeout(closeTimer)
		if (suppressed.current) return
		const markerId = getMarkerId()
		openTimer = window.setTimeout(
			() => hoveredMarkerId.set(editor, markerId),
			PREVIEW_OPEN_DELAY_MS
		)
	}

	function onPointerLeave() {
		window.clearTimeout(openTimer)
		window.clearTimeout(closeTimer)
		const markerId = getMarkerId()
		closeTimer = window.setTimeout(() => {
			if (hoveredMarkerId.get(editor) === markerId) hoveredMarkerId.set(editor, null)
		}, PREVIEW_CLOSE_DELAY_MS)
	}

	return {
		get previewShown() {
			return hovered.current === getMarkerId() && !suppressed.current
		},
		previewHandlers: { onPointerEnter, onPointerLeave },
	}
}
