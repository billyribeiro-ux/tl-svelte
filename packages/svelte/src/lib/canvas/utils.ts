import { tlenv, toDomPrecision, type Editor, type TLShape } from '@svelte-draw/editor'
import { modulate } from '@svelte-draw/utils'

/**
 * Writes a CSS property on an element if it exists. Mirrors `setStyleProperty` in the editor's
 * `utils/dom` (which is not part of the public barrel).
 */
export function setStyleProperty(
	elm: HTMLElement | null,
	property: string,
	value: string | number
) {
	if (!elm) return
	elm.style.setProperty(property, String(value))
}

/**
 * The CSS `transform` that puts a 1px-sized html layer into page space under the current camera.
 * Shared by every camera-tracked DOM layer (the canvas's shape layer, the collaborator cursor
 * layer) so they line up exactly and can't drift apart.
 *
 * The offset compensates for the layer's 1px width/height when zoomed, so it registers precisely
 * with the other layers.
 *
 * Ported from `getHtmlLayerTransform` in the editor package (internal there).
 */
export function getHtmlLayerTransform(editor: Editor): string {
	const { x, y, z } = editor.getCamera()
	const offset =
		z >= 1 ? modulate(z, [1, 8], [0.125, 0.5], true) : modulate(z, [0.1, 1], [-2, 0.125], true)
	return `scale(${toDomPrecision(z)}) translate(${toDomPrecision(x + offset)}px,${toDomPrecision(
		y + offset
	)}px)`
}

/**
 * Checks if two shapes are equal by comparing their props and meta. This is the equality the React
 * `memo(InnerShape)` used; the Svelte `InnerShape` achieves the same with `$derived(shape.props)`.
 */
export function areShapesContentEqual(a: TLShape, b: TLShape) {
	return a.props === b.props && a.meta === b.meta
}

interface PointerLike {
	button: number
	ctrlKey: boolean
	metaKey: boolean
}

/** @internal */
export function isSecondaryClickEvent(e: PointerLike) {
	return e.button === 2 || (tlenv.isDarwin && e.button === 0 && e.ctrlKey && !e.metaKey)
}

/** @internal */
export function getPointerEventButton(e: PointerLike) {
	return isSecondaryClickEvent(e) ? 2 : e.button
}

/**
 * Decide whether a pen pointer event looks like direct manipulation on the display (e.g. Apple
 * Pencil on an iPad or a Surface Pen on a touchscreen) rather than indirect input from a desktop
 * graphics tablet (e.g. a Wacom Intuos). See the editor's `utils/pointer` for the full rationale:
 * we key off the device's fixed touch capability (`tlenv.isTouchDevice`), not the editor's dynamic
 * `isCoarsePointer` state.
 */
export function isDirectDisplayPen(e: PointerEvent): boolean {
	if (e.pointerType !== 'pen') return false
	return tlenv.isTouchDevice
}
