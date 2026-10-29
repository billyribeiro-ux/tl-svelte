import { Editor } from 'svelte-draw'

/** A pointer-down that belongs to the camera, not the comment UI: any non-primary button
 *  (middle/right-button pans), or a primary press with the spacebar pan key held. */
export function isCanvasPanGesture(editor: Editor, e: PointerEvent) {
	return e.button !== 0 || editor.inputs.keys.has('Space')
}

/** Hand a pointer event to the canvas beneath the comments layer, marked the same way the
 *  pass-through wheel/hover hooks mark their re-dispatched events. */
export function forwardPointerEventToCanvas(container: HTMLElement, e: PointerEvent) {
	const cvs = container.querySelector('.tl-canvas')
	if (!cvs) return
	const newEvent = new PointerEvent(e.type, e as any)
	;(newEvent as any).isSpecialRedispatchedEvent = true
	cvs.dispatchEvent(newEvent)
}
