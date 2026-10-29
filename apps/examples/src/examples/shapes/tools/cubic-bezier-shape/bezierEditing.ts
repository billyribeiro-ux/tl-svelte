import {
	type Editor,
	type StateNode,
	type TLAnyOverlayUtilConstructor,
	type TLHandle,
	type TLOverlay,
	type TLPointerEventInfo,
	type TLShapeId,
	createShapeId,
} from 'svelte-draw'
import { BezierShapeHandleOverlayUtil } from './BezierShapeHandleOverlayUtil'

type ShapeHandleOverlay = TLOverlay<{ shapeId: TLShapeId; handle: TLHandle }>

type PointingHandleState = StateNode & {
	info?: TLPointerEventInfo & { target: 'handle' }
}

function getPointingHandleInfo(
	state: PointingHandleState,
	fallback?: TLPointerEventInfo
): (TLPointerEventInfo & { target: 'handle' }) | undefined {
	if (state.info?.target === 'handle') return state.info
	if (fallback?.target === 'handle') return fallback
	return undefined
}

export const customOverlays: TLAnyOverlayUtilConstructor[] = [BezierShapeHandleOverlayUtil]

function startEditingBezierShape(editor: Editor, id: TLShapeId) {
	editor.setEditingShape(id)
	editor.setCurrentTool('select.editing_shape')
}

function getBezierHandleOverlayAtPoint(editor: Editor): ShapeHandleOverlay | null {
	const overlay = editor.overlays.getOverlayAtPoint(
		editor.inputs.getCurrentPagePoint(),
		editor.options.hitTestMargin / editor.getZoomLevel()
	)
	if (!overlay || overlay.type !== 'shape_handle') return null

	const shapeHandleOverlay = overlay as ShapeHandleOverlay
	const shape = editor.getShape(shapeHandleOverlay.props.shapeId)
	if (!shape || !editor.isShapeOfType(shape, 'bezier-curve')) return null

	return shapeHandleOverlay
}

function updateHoveredBezierHandle(editor: Editor) {
	const editingShape = editor.getEditingShape()
	if (!editingShape || !editor.isShapeOfType(editingShape, 'bezier-curve')) return false

	const overlay = getBezierHandleOverlayAtPoint(editor)
	const previousOverlayId = editor.overlays.getHoveredOverlayId()

	if (overlay) {
		editor.overlays.setHoveredOverlay(overlay.id)
		editor.setHoveredShape(null)

		const cursor = editor.overlays.getOverlayUtil(overlay).getCursor(overlay)
		if (cursor) {
			editor.setCursor({ type: cursor, rotation: editor.getSelectionRotation() })
		}

		return true
	}

	if (previousOverlayId) {
		editor.setCursor({ type: 'default', rotation: 0 })
	}

	editor.overlays.setHoveredOverlay(null)
	return false
}

// The editor wiring that used to be the example's `onMount` (see the guide in
// CubicBezierShapeExample.svelte, footnote [2]).
export function setupBezierEditing(editor: Editor) {
	editor.user.updateUserPreferences({ isSnapMode: true })

	const viewportPageBounds = editor.getViewportPageBounds()
	const centerX = viewportPageBounds.center.x
	const centerY = viewportPageBounds.center.y

	const id = createShapeId()
	editor.createShape({
		id,
		type: 'bezier-curve',
		x: centerX - 200,
		y: centerY - 150,
	})

	// Select and edit the shape on appear
	editor.select(id)
	startEditingBezierShape(editor, id)

	// [2]
	const pointingHandleState =
		editor.getStateDescendant<PointingHandleState>('select.pointing_handle')
	const editingShapeState = editor.getStateDescendant<StateNode>('select.editing_shape')

	if (!pointingHandleState) {
		throw new Error('SelectTool pointing_handle state not found')
	}
	if (!editingShapeState) {
		throw new Error('SelectTool editing_shape state not found')
	}

	const originalHandlers = {
		pointingHandle: {
			onPointerMove: pointingHandleState.onPointerMove?.bind(pointingHandleState),
			onPointerUp: pointingHandleState.onPointerUp?.bind(pointingHandleState),
		},
		editingShape: {
			onPointerDown: editingShapeState.onPointerDown?.bind(editingShapeState),
			onPointerMove: editingShapeState.onPointerMove?.bind(editingShapeState),
		},
	}

	// clicking on start or end point should not go to select.idle
	pointingHandleState.onPointerUp = (info: TLPointerEventInfo) => {
		const handleInfo = getPointingHandleInfo(pointingHandleState, info)
		if (!handleInfo) {
			originalHandlers.pointingHandle.onPointerUp?.(info)
			return
		}

		if (
			handleInfo.accelKey &&
			editor.isShapeOfType(handleInfo.shape, 'bezier-curve') &&
			handleInfo.target === 'handle'
		) {
			switch (handleInfo.handle.id) {
				case 'cp1': {
					editor.updateShape({
						id: handleInfo.shape.id,
						type: 'bezier-curve',
						props: {
							cp1: {
								x: handleInfo.shape.props.start.x,
								y: handleInfo.shape.props.start.y,
							},
						},
					})

					startEditingBezierShape(editor, handleInfo.shape.id)
					return
				}
				case 'cp2': {
					editor.updateShape({
						id: handleInfo.shape.id,
						type: 'bezier-curve',
						props: {
							cp2: { x: handleInfo.shape.props.end.x, y: handleInfo.shape.props.end.y },
						},
					})

					startEditingBezierShape(editor, handleInfo.shape.id)
					return
				}
			}
		}

		if (editor.isShapeOfType(handleInfo.shape, 'bezier-curve') && handleInfo.target === 'handle') {
			startEditingBezierShape(editor, handleInfo.shape.id)
			return
		}

		originalHandlers.pointingHandle.onPointerUp?.(info)
	}

	// return to editing state after dragging a handle
	pointingHandleState.onPointerMove = (info: TLPointerEventInfo) => {
		if (!editor.inputs.getIsDragging()) {
			originalHandlers.pointingHandle.onPointerMove?.(info)
			return
		}

		const handleInfo = getPointingHandleInfo(pointingHandleState, info)
		if (!handleInfo) {
			originalHandlers.pointingHandle.onPointerMove?.(info)
			return
		}

		if (editor.isShapeOfType(handleInfo.shape, 'bezier-curve')) {
			editor.updateInstanceState({ isToolLocked: true })
			editor.setCurrentTool('select.dragging_handle', {
				...handleInfo,
				onInteractionEnd: () => {
					startEditingBezierShape(editor, handleInfo.shape.id)
				},
			})
			return
		}

		originalHandlers.pointingHandle.onPointerMove?.(info)
	}

	editingShapeState.onPointerDown = (info: TLPointerEventInfo) => {
		const editingShape = editor.getEditingShape()
		if (editingShape && editor.isShapeOfType(editingShape, 'bezier-curve')) {
			const overlay = getBezierHandleOverlayAtPoint(editor)

			if (overlay) {
				editor.setCurrentTool('select.pointing_handle', {
					...info,
					target: 'handle',
					shape: editingShape,
					handle: overlay.props.handle,
				})
				return
			}
		}

		originalHandlers.editingShape.onPointerDown?.(info)
	}

	// allow translating in editing state
	editingShapeState.onPointerMove = (info: TLPointerEventInfo) => {
		if (updateHoveredBezierHandle(editor) && !editor.inputs.getIsDragging()) return

		if (editor.inputs.getIsDragging()) {
			const editingShape = editor.getEditingShape()
			if (editingShape && editor.isShapeOfType(editingShape, 'bezier-curve')) {
				editor.updateInstanceState({ isToolLocked: true })

				editor.setCurrentTool('select.translating', {
					...info,
					target: 'shape',
					shape: editingShape,
					onInteractionEnd: () => {
						startEditingBezierShape(editor, editingShape.id)
					},
				})
				return
			}
		}

		originalHandlers.editingShape.onPointerMove?.(info)
	}
}
