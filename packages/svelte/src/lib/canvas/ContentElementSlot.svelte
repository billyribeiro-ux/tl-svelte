<script lang="ts">
	import { warnOnce } from '@svelte-draw/utils'
	import { moveElementInto, type Editor, type ShapeUtil, type TLShapeId } from '@svelte-draw/editor'
	import type { Attachment } from 'svelte/attachments'
	import { getEditor } from '../context/editor'
	import { tryGetContentSlots } from './contentSlots'

	/*
	The content element slot hosts an app-owned element provided by the shape util's
	getAppOwnedElement method. The contract: while the shape is mounted, svelte-draw never
	unmounts, recreates, or relocates the element (the canvas renders shapes in stable
	id-sorted DOM order, so reorders and reparenting never move DOM nodes), and before
	the slot is destroyed — shape deletion, page change, error teardown, or the whole
	editor unmounting — onReleaseAppOwnedElement is called while the slot is still
	connected to the document, so the app can move the element to a new parent with
	Node.moveBefore without resetting its state.

	React guaranteed that last part by using a layout effect (its cleanups run before the host
	nodes of a deleted subtree are detached). Svelte does the opposite: it removes a destroyed
	block's DOM first and runs effect/attachment teardowns afterwards. So the guarantee is kept in
	two places instead (see ../contentSlots.ts): `ShapesLayer` releases the slots of shapes that are
	leaving the rendering list in a `$effect.pre` (which runs before the keyed each block updates the
	DOM), and `DefaultCanvas` releases every slot from a global out-transition on `.tl-canvas` (which
	runs before the DOM is removed when the editor is unmounted with `unmount(app, { outro: true })`).
	The attachment teardown below calls the same idempotent release as a last resort: on that path the
	slot is already detached, so the app cannot do a state-preserving move.
	*/
	let { id, util }: { id: TLShapeId; util: ShapeUtil<any> } = $props()

	const editor = getEditor()
	const slots = tryGetContentSlots()

	// Runs once per shape mount (re-runs only if `id` or `util` change): getAppOwnedElement is
	// called once per [editor, id, util], so the adopted element is not refreshed when the shape's
	// props change. A util whose element identity depends on props must mutate the existing element
	// in place rather than return a new one. Likewise, if this returns null now and an element only
	// later, the element is never adopted for this mount — return a stable element up front and
	// populate it asynchronously instead.
	//
	// `$derived` so the attachment only re-runs when the *value* of `id` / `util` changes: a prop that
	// reads through a parent's reactive item would otherwise invalidate whenever that item is replaced
	// (e.g. on every z-order change), re-adopting the element and calling the release hook.
	const slotId = $derived(id)
	const slotUtil = $derived(util)
	const adopt: Attachment<HTMLDivElement> = (slot) => {
		const currentId = slotId
		const currentUtil = slotUtil

		const shape = editor.getShape(currentId)
		if (!shape) return

		const element = currentUtil.getAppOwnedElement?.(shape)
		if (!element) return

		// An element that was connected before adoption (e.g. parked off-canvas by the
		// app between editor sessions) should survive the move without reloading.
		const wasConnectedBeforeAdoption = element.isConnected

		if (element.parentNode !== slot) {
			moveElementInto(slot, element)
		}

		if (process.env.NODE_ENV !== 'production' && wasConnectedBeforeAdoption) {
			warnIfContentElementReloads(editor, slot, element)
		}

		let released = false
		function release() {
			if (released) return
			released = true
			slots?.unregister(currentId, release)

			// Note: this can run while the shape still exists (e.g. if the slot is rebuilt because
			// `id` or `util` changed), so onReleaseAppOwnedElement must be safe to call then; don't
			// treat it as a definitive "shape removed" signal (check the store if you need to know).
			const latestShape = editor.getShape(currentId) ?? shape!
			currentUtil.onReleaseAppOwnedElement?.(latestShape, element!)
			if (process.env.NODE_ENV !== 'production' && element!.parentNode === slot) {
				warnOnce(
					`The content element for shape "${currentId}" was not reclaimed by onReleaseAppOwnedElement and will be destroyed along with its slot, losing any state it holds.`
				)
			}
		}

		slots?.register(currentId, release)
		return release
	}

	// Dev-mode assertion that adoption kept the platform's state-preservation promise: a
	// load event firing on a previously-connected adopted element means the embed reloaded.
	// load doesn't bubble, but capture-phase listeners on ancestors still observe it.
	function warnIfContentElementReloads(editor: Editor, slot: HTMLElement, element: HTMLElement) {
		const onLoad = (event: Event) => {
			if (event.target !== element && !element.contains(event.target as Node)) return
			warnOnce(
				'A load event fired on an adopted content element. The element reloaded when it was moved into the shape, losing its state. State-preserving moves need Node.moveBefore (Chromium 133+, Firefox 144+) and a continuously connected element.'
			)
		}
		slot.addEventListener('load', onLoad, { capture: true })
		editor.timers.setTimeout(
			() => slot.removeEventListener('load', onLoad, { capture: true }),
			1000
		)
	}
</script>

<div class="tl-content-slot" draggable={false} {@attach adopt}></div>
