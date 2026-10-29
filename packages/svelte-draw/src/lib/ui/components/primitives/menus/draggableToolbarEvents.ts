import { getPointerInfo, Vec, type Editor, type VecModel } from '@svelte-draw/editor'
import type { TLUiToolItem } from '../../../hooks'
import { hideAllTooltips } from '../tooltipManager'

/**
 * Distance alone can't separate a drag from a tap: stylus, finger and trackpad taps move a few
 * pixels, which used to spawn shapes (#6906, #7666). Leaving the toolbar is the intent signal;
 * the distance threshold only guards presses that land right at its edge.
 */
function isDragOutOfToolbar(
	editor: Editor,
	e: PointerEvent,
	screenSpaceStart: VecModel,
	toolbarRect: DOMRect
) {
	const { left, top, right, bottom } = toolbarRect
	const { clientX: x, clientY: y } = e
	if (x >= left && x <= right && y >= top && y <= bottom) return false

	// Read the pointer type off the event rather than `isCoarsePointer`: the instance state flag
	// is synced a frame after the first pointer down, so a pen tap right after mouse use would be
	// judged with the mouse threshold.
	const minDistanceSq =
		e.pointerType === 'mouse'
			? editor.options.uiDragDistanceSquared
			: editor.options.uiCoarseDragDistanceSquared
	return Vec.Dist2(screenSpaceStart, { x, y }) > minDistanceSq
}

type PointerHandler = (e: PointerEvent & { currentTarget: HTMLElement }) => void

/**
 * Pointer handlers for a toolbar button that can be dragged out of the toolbar to create a shape.
 * Replaces `useDraggableEvents`. Spread the result onto the button (`onpointerdown`, ...).
 * `onDragStart` / `onSelect` are read through getters so they stay current.
 */
export function createDraggableToolbarEvents(
	editor: Editor,
	getOnDragStart: () => TLUiToolItem['onDragStart'],
	getOnSelect: () => TLUiToolItem['onSelect']
): {
	onpointerdown: PointerHandler
	onpointermove: PointerHandler
	onpointerup: PointerHandler
	onclick(): void
} {
	let state = { name: 'idle' } as
		| {
				name: 'idle'
		  }
		| {
				name: 'pointing'
				screenSpaceStart: VecModel
				toolbarRect: DOMRect
		  }
		| {
				name: 'dragging'
				screenSpaceStart: VecModel
		  }
		| {
				name: 'dragged'
		  }

	function handlePointerDown(e: PointerEvent & { currentTarget: HTMLElement }) {
		state = {
			name: 'pointing',
			screenSpaceStart: { x: e.clientX, y: e.clientY },
			// The overflow popover is its own .tlui-toolbar; a button outside any toolbar falls
			// back to its own rect.
			toolbarRect: (
				e.currentTarget.closest('.tlui-toolbar') ?? e.currentTarget
			).getBoundingClientRect(),
		}

		e.currentTarget.setPointerCapture(e.pointerId)
	}

	function handlePointerMove(e: PointerEvent & { currentTarget: HTMLElement }) {
		if ((e as any).isSpecialRedispatchedEvent) return

		if (state.name === 'pointing') {
			if (isDragOutOfToolbar(editor, e, state.screenSpaceStart, state.toolbarRect)) {
				const screenSpaceStart = state.screenSpaceStart
				state = {
					name: 'dragging',
					screenSpaceStart,
				}

				editor.run(() => {
					editor.setCurrentTool('select')

					// Set origin point
					editor.dispatch({
						type: 'pointer',
						target: 'canvas',
						name: 'pointer_down',
						...getPointerInfo(editor, e),
						point: screenSpaceStart,
					})

					// Pointer down potentially selects shapes, so we need to deselect them.
					editor.selectNone()

					// start drag
					getOnDragStart()?.('toolbar', {
						type: 'pointer',
						target: 'canvas',
						name: 'pointer_move',
						...getPointerInfo(editor, e),
						point: screenSpaceStart,
					})

					// The shape was created at the press point, under the toolbar, and this event is
					// already marked as handled so the canvas won't forward it. Move the shape to the
					// pointer now, or it sits there until the next pointer move.
					editor.dispatch({
						type: 'pointer',
						target: 'canvas',
						name: 'pointer_move',
						...getPointerInfo(editor, e),
					})

					hideAllTooltips()
					editor.getContainer().focus()
				})
			}
		}
	}

	function handlePointerUp(e: PointerEvent & { currentTarget: HTMLElement }) {
		if ((e as any).isSpecialRedispatchedEvent) return

		e.currentTarget.releasePointerCapture(e.pointerId)

		editor.dispatch({
			type: 'pointer',
			target: 'canvas',
			name: 'pointer_up',
			...getPointerInfo(editor, e),
		})
	}

	function handleClick() {
		if (state.name === 'dragging' || state.name === 'dragged') {
			state = { name: 'idle' }
			return
		}

		state = { name: 'idle' }
		getOnSelect()?.('toolbar')
	}

	return {
		onpointerdown: handlePointerDown,
		onpointermove: handlePointerMove,
		onpointerup: handlePointerUp,
		onclick: handleClick,
	}
}
