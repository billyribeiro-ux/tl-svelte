<script lang="ts">
	import {
		Vec,
		getPointerInfo,
		releasePointerCapture,
		setPointerCapture,
	} from '@svelte-draw/editor'
	import type { Attachment } from 'svelte/attachments'
	import { getEditor } from '../context/editor'
	import { fromComputed } from '../state/fromSignal'
	import { useCanvasEvents } from './useCanvasEvents.svelte'
	import { getPointerEventButton } from './utils'

	/**
	 * When a menu is open, this component prevents the user from interacting with the canvas.
	 *
	 * @public
	 */
	const editor = getEditor()

	const isMenuOpen = fromComputed('is menu open', () => editor.menus.hasAnyOpenMenus())

	// Keep this component mounted while the pointer is down so pointerup/move still
	// land here after a synchronous clearOpenMenus() flips isMenuOpen to false. (The state is set
	// before clearOpenMenus() runs, and Svelte only applies it at the next flush, so no
	// `flushSync` is needed here as it was with React.)
	let isPointing = $state(false)
	const showElement = $derived(isMenuOpen.current || isPointing)

	const canvasEvents = useCanvasEvents()

	const pointerState = {
		isDown: false,
		isDragging: false,
		button: 0,
		pointerId: -1,
		start: new Vec(),
	}

	// Swallow the native contextmenu that follows a right-click pointerdown. Without
	// this, the menu library's trigger catches the native event and opens a menu at the pointer-
	// DOWN position — then our own synthetic contextmenu (fired on pointerup) opens it
	// again at the release position, producing a visible flash.
	let cancelContextMenuSwallow: null | (() => void) = null
	$effect(
		() => () => {
			cancelContextMenuSwallow?.()
			cancelContextMenuSwallow = null
		}
	)
	function swallowNextNativeContextMenu() {
		cancelContextMenuSwallow?.()
		const doc = editor.getContainerDocument()
		const onContextMenu = (event: MouseEvent) => {
			// Skip our own synthetic contextmenu — only swallow the real browser one
			if (!event.isTrusted) return
			cancelContextMenuSwallow?.()
			cancelContextMenuSwallow = null
			event.preventDefault()
			event.stopImmediatePropagation()
		}
		const cancel = () => doc.removeEventListener('contextmenu', onContextMenu, true)
		cancelContextMenuSwallow = cancel
		doc.addEventListener('contextmenu', onContextMenu, true)
		// Drop the listener on the next tick if it never fires (e.g. pointer moved off-screen)
		doc.defaultView?.setTimeout(() => {
			if (cancelContextMenuSwallow === cancel) {
				cancel()
				cancelContextMenuSwallow = null
			}
		}, 0)
	}

	function resetPointerState(e: PointerEvent) {
		pointerState.isDown = false
		pointerState.isDragging = false
		pointerState.button = 0
		pointerState.pointerId = -1
		pointerState.start = new Vec(e.clientX, e.clientY)
	}

	function handlePointerDown(e: PointerEvent) {
		// This overlay tracks a single press. A second pointer landing while one is active —
		// a palm resting on the glass beside a pen — must not take over the gesture, or its
		// own cancel would end the press it stole.
		if (pointerState.isDown) return

		const button = getPointerEventButton(e)
		if (button !== 0 && button !== 2) return

		if (button === 2 && editor.options.rightClickPanning) {
			// Forward right-click pointerdown through the canvas's own handler so
			// pointer capture is set on the canvas (load-bearing: without this
			// the context menu briefly flashes closed during consecutive right-clicks).
			// The canvas owns the rest of the gesture, so don't capture or mark
			// pointing here: this element's pointerup would never fire, leaving it
			// mounted over the canvas after the menu closes.
			// We don't clearOpenMenus() — the menu library's dismissable layer closes the menu
			// via outside-click detection, keeping its internal state in sync.
			const canvas =
				editor.getContainer().querySelector<HTMLDivElement>('.tl-canvas') ??
				(e.currentTarget as Element)
			canvasEvents.onPointerDown(e, canvas)
			swallowNextNativeContextMenu()
			return
		}

		isPointing = true
		setPointerCapture(e.currentTarget as Element, e)
		pointerState.isDown = true
		pointerState.isDragging = false
		pointerState.button = button
		pointerState.pointerId = e.pointerId
		pointerState.start = new Vec(e.clientX, e.clientY)

		if (button === 2) {
			// Right-click panning off: swallow the native contextmenu that would otherwise
			// briefly open a new menu (causing a flash) once the open one closes below.
			swallowNextNativeContextMenu()
		}

		editor.menus.clearOpenMenus()
	}

	function handlePointerMove(e: PointerEvent) {
		const state = pointerState
		if (!state.isDown || state.pointerId !== e.pointerId) return

		// Left-click: wait for the drag threshold before forwarding anything, then
		// replay pointerdown at the original start so the editor records the
		// correct drag origin. Right-click forwards moves immediately.
		if (state.button !== 2 && !state.isDragging) {
			if (
				Vec.Dist2(state.start, new Vec(e.clientX, e.clientY)) <=
				editor.options.dragDistanceSquared
			) {
				return
			}
			state.isDragging = true
			editor.dispatch({
				type: 'pointer',
				target: 'canvas',
				name: 'pointer_down',
				// `getPointerInfo` reads these off the event, so pass the recorded start point
				...getPointerInfo(editor, startPointEvent(e, state.start)),
			})
		}

		editor.dispatch({
			type: 'pointer',
			target: 'canvas',
			name: 'pointer_move',
			...getPointerInfo(editor, e),
		})
	}

	// React spread the synthetic event (`{ ...e, clientX, clientY }`); a native event's fields live
	// on its prototype, so build a view of it with the start point instead.
	function startPointEvent(e: PointerEvent, start: Vec): PointerEvent {
		return new Proxy(e, {
			get(target, prop) {
				if (prop === 'clientX') return start.x
				if (prop === 'clientY') return start.y
				const value = Reflect.get(target, prop, target)
				return typeof value === 'function' ? value.bind(target) : value
			},
		})
	}

	function handlePointerUp(e: PointerEvent) {
		const state = pointerState
		if (!state.isDown || state.pointerId !== e.pointerId) return

		const isStaticRightClick = state.button === 2 && !state.isDragging

		editor.dispatch({
			type: 'pointer',
			target: 'canvas',
			name: 'pointer_up',
			...getPointerInfo(editor, e),
			button: state.button === 2 ? 2 : getPointerEventButton(e),
		})

		if (isStaticRightClick && editor.options.rightClickPanning) {
			// Dispatch contextmenu on the canvas's parent (the menu's trigger) so the
			// menu opens at the release position. Bypassing the canvas avoids its
			// own onContextMenu handler, which preventDefaults non-synthesized events.
			const canvas = editor.getContainer().querySelector<HTMLDivElement>('.tl-canvas')
			const trigger = canvas?.parentElement ?? (e.currentTarget as Element)
			editor.timers.requestAnimationFrame(() => {
				trigger.dispatchEvent(
					new PointerEvent('contextmenu', {
						bubbles: true,
						clientX: e.clientX,
						clientY: e.clientY,
						button: 2,
						buttons: 0,
						pointerId: e.pointerId,
						pointerType: e.pointerType,
						isPrimary: e.isPrimary,
					})
				)
			})
		}

		releasePointerCapture(e.currentTarget as Element, e)
		isPointing = false
		resetPointerState(e)
	}

	function handlePointerCancel(e: PointerEvent) {
		const state = pointerState
		if (!state.isDown || state.pointerId !== e.pointerId) {
			// Either a right-click press that was forwarded to the canvas, or a pointer this
			// overlay never tracked. Neither is ours to end, so let the canvas handler decide.
			canvasEvents.onPointerCancel(e)
			return
		}

		// The canvas's own cancel handler doesn't know about this element's pointer
		// state, so without this the overlay stays mounted over the canvas and
		// swallows the next interaction after the browser cancels a press.
		if (editor.inputs.getIsPointing()) {
			editor.interrupt()
			editor.dispatch({
				type: 'pointer',
				target: 'canvas',
				name: 'pointer_up',
				...getPointerInfo(editor, e),
				// pointercancel reports button -1
				button: state.button,
			})
		} else {
			editor.markEventAsHandled(e)
		}

		releasePointerCapture(e.currentTarget as Element, e)
		isPointing = false
		resetPointerState(e)
	}

	const pointerHandlers: Attachment<HTMLElement> = (element) => {
		const listeners: Array<[string, (e: any) => void]> = [
			['pointerdown', handlePointerDown],
			['pointermove', handlePointerMove],
			['pointerup', handlePointerUp],
			['pointercancel', handlePointerCancel],
			[
				'contextmenu',
				(e: MouseEvent) => {
					e.preventDefault()
					e.stopPropagation()
				},
			],
		]
		for (const [name, handler] of listeners) element.addEventListener(name, handler)
		return () => {
			for (const [name, handler] of listeners) element.removeEventListener(name, handler)
		}
	}
</script>

{#if showElement}
	<!-- The canvas handlers minus the ones this overlay replaces with its own press tracking. -->
	<div
		class="tlui-menu-click-capture"
		data-testid="menu-click-capture.content"
		{@attach canvasEvents.attach(['pointerdown', 'pointerup', 'pointercancel', 'contextmenu'])}
		{@attach pointerHandlers}
	></div>
{/if}
