import { untrack } from 'svelte'
import { getBreakpoint, getContainer, PORTRAIT_BREAKPOINT } from 'svelte-draw'
import { getVisibleViewport } from '../ui/visual-viewport'

/**
 * Mobile mode for the commenting surfaces — the same breakpoint gate as svelte-draw's mobile toolbar and
 * style panel (which also honors `forceMobile` on `<SvelteDraw>`). The commenting layer can mount
 * without svelte-draw's default UI (`hideUi`, custom UI), where the breakpoint provider is absent and
 * `getBreakpoint` throws; fall back to desktop there, matching the pre-mobile rendering those hosts
 * always had.
 *
 * Call during component initialisation. Replaces `useIsMobileCommenting`.
 */
export function createIsMobileCommenting(): { readonly current: boolean } {
	let breakpoint: { readonly current: number } | null = null
	try {
		breakpoint = getBreakpoint()
	} catch {
		// No breakpoint provider: desktop.
	}
	return {
		get current() {
			return breakpoint !== null && breakpoint.current < PORTRAIT_BREAKPOINT.TABLET_SM
		},
	}
}

const VIEWPORT_MARGIN = 8

/**
 * Keep a canvas-anchored panel — the pending composer or an open thread popover — within the
 * visible viewport on mobile. The software keyboard shrinks the *visual* viewport while leaving the
 * layout viewport (and CSS `dvh`) untouched, so a panel placed at a fixed offset from its pin can
 * end up behind the keyboard. On mobile this clamps the panel's top-left into the visible box so it
 * stays on-screen above the keyboard. Desktop is untouched: when `enabled` is false the base point
 * is returned unchanged, tracking the camera exactly as before.
 *
 * `getBase` is the panel's desired top-left in container-relative viewport coordinates (what the
 * call site would otherwise write straight into `left`/`top`). Every input is a getter so it follows
 * reactive props; `getElement` is the panel element (null until it mounts). Call during component
 * initialisation. Replaces `useMobilePlacement`.
 */
export function createMobilePlacement(
	getElement: () => HTMLElement | null,
	getBase: () => { x: number; y: number },
	getEnabled: () => boolean
): { readonly left: number; readonly top: number } {
	const container = getContainer()
	const initialBase = getBase()
	let placed = $state.raw<{ left: number; top: number }>({
		left: initialBase.x,
		top: initialBase.y,
	})
	// The camera moves `base` every frame while panning. Reading it from a plain variable keeps
	// `update` stable across those frames, so the observers below are set up once per panel rather
	// than being torn down and rebuilt each frame.
	let base = { x: initialBase.x, y: initialBase.y }

	function update(el: HTMLElement) {
		const win = container.ownerDocument.defaultView ?? window
		const { x, y } = base

		// Panel coordinates are container-relative; the visual viewport is window-relative.
		const cRect = container.getBoundingClientRect()
		const vp = getVisibleViewport(win)
		const top = vp.top - cRect.top + VIEWPORT_MARGIN
		const bottom = vp.bottom - cRect.top - VIEWPORT_MARGIN
		const left = vp.left - cRect.left + VIEWPORT_MARGIN
		const right = vp.right - cRect.left - VIEWPORT_MARGIN

		const w = el.offsetWidth
		const h = el.offsetHeight

		const nextLeft = Math.max(left, Math.min(x, right - w))
		// The keyboard only ever covers space from the bottom, so it can pull the panel up (when its
		// bottom would be hidden) but must never push it down below its natural spot. `y` is the
		// floor: any spurious rise in `top` (e.g. iOS scrolling the page to reveal a focused input)
		// is capped here, so a panel that already clears the keyboard doesn't move at all.
		const nextTop = Math.min(y, Math.max(top, bottom - h))
		if (placed.left === nextLeft && placed.top === nextTop) return
		placed = { left: nextLeft, top: nextTop }
	}

	// Re-place as the camera moves the panel's base point.
	$effect(() => {
		const { x, y } = getBase()
		const enabled = getEnabled()
		const el = getElement()
		untrack(() => {
			base = { x, y }
			if (enabled && el) update(el)
		})
	})

	// Re-place when the panel grows (replies, edits), when the visual viewport changes (keyboard,
	// pinch-zoom), or when the window resizes.
	$effect(() => {
		if (!getEnabled()) return
		const el = getElement()
		if (!el) return
		const win = container.ownerDocument.defaultView ?? window
		const onChange = () => update(el)
		const ro = new ResizeObserver(onChange)
		ro.observe(el)
		const vv = win.visualViewport
		vv?.addEventListener('resize', onChange)
		vv?.addEventListener('scroll', onChange)
		win.addEventListener('resize', onChange)
		return () => {
			ro.disconnect()
			vv?.removeEventListener('resize', onChange)
			vv?.removeEventListener('scroll', onChange)
			win.removeEventListener('resize', onChange)
		}
	})

	// Desktop keeps its fixed placement, recomputed each read so it tracks the pin as the camera
	// moves.
	return {
		get left() {
			return getEnabled() ? placed.left : getBase().x
		},
		get top() {
			return getEnabled() ? placed.top : getBase().y
		},
	}
}
