import {
	StateNode,
	Vec,
	createShapeId,
	type TLClickEventInfo,
	type TLKeyboardEventInfo,
	type TLPointerEventInfo,
	type TLShapeHandleOverlay,
	type TLShapeId,
} from 'svelte-draw'
import { corner, insertPenPoint, type PenHandleOverlayUtil, type PenShape } from './PenShapeUtil'

type HandlePart = 'point' | 'in' | 'out'

// [1]
class PenInteraction extends StateNode {
	shapeId: TLShapeId | null = null
	drag: {
		shape: PenShape
		index: number
		part: HandlePart
		origin: Vec
		mark: string
		creating: boolean
	} | null = null

	get shape() {
		return this.shapeId ? this.editor.getShape<PenShape>(this.shapeId) : undefined
	}

	getPoint(shape: PenShape) {
		return this.editor.getPointInShapeSpace(shape, this.editor.inputs.getCurrentPagePoint())
	}

	getHandleOverlay(shape: PenShape) {
		const overlay = this.editor.overlays.getOverlayAtPoint(
			this.editor.inputs.getCurrentPagePoint(),
			this.editor.getHitTestMargin()
		)
		if (overlay?.type !== 'shape_handle' || overlay.props.shapeId !== shape.id) return
		return overlay as TLShapeHandleOverlay
	}

	startDrag(shape: PenShape, index: number, part: HandlePart, mark: string, creating = false) {
		this.drag = { shape, index, part, origin: this.getPoint(shape), mark, creating }
	}

	override onPointerMove(info: TLPointerEventInfo) {
		const drag = this.drag
		if (!drag || !this.editor.inputs.getIsDragging() || !this.shape) return
		const { shape, index, part, creating, origin } = drag
		const node = shape.props.points[index]
		const delta = Vec.Sub(this.getPoint(shape), origin)
		const points = [...shape.props.points]
		if (part === 'point') {
			points[index] = { ...node, point: Vec.Add(node.point, delta).toJson() }
		} else {
			const handle = Vec.Add(node[part], delta)
			const opposite = part === 'in' ? 'out' : 'in'
			const coupled = creating || (node.smooth && !info.altKey)
			points[index] = {
				...node,
				[part]: handle.toJson(),
				[opposite]: coupled
					? Vec.Mul(
							Vec.Uni(handle),
							-(creating ? Vec.Len(handle) : Vec.Len(node[opposite]))
						).toJson()
					: node[opposite],
				smooth: coupled,
			}
		}
		this.editor.updateShape<PenShape>({ id: shape.id, type: 'pen-path', props: { points } })
	}

	override onPointerUp() {
		this.drag = null
	}

	override onKeyDown(info: TLKeyboardEventInfo) {
		if (info.key === 'Enter') this.finish()
	}

	override onCancel() {
		if (this.drag) {
			this.editor.bailToMark(this.drag.mark)
			this.drag = null
		} else {
			this.editor.setCurrentTool('select')
		}
	}

	override onComplete() {
		// Undo/redo call complete; keep the active path available for the next edit.
		this.drag = null
	}

	finish() {
		this.editor.setCurrentTool('select')
	}
	override onInterrupt() {
		this.drag = null
	}
	override onExit() {
		this.drag = null
	}
}

class Drawing extends PenInteraction {
	static override id = 'drawing'

	override onEnter() {
		this.shapeId = null
		this.editor.selectNone().setCursor({ type: 'cross', rotation: 0 })
	}

	private canClose(shape: PenShape) {
		return (
			shape.props.points.length >= 3 &&
			Vec.Dist(this.getPoint(shape), shape.props.points[0].point) < 10 / this.editor.getZoomLevel()
		)
	}

	private updateClosingHandle() {
		const shape = this.shape
		const overlay =
			!this.drag && shape && this.canClose(shape)
				? this.editor.overlays
						.getOverlayUtil<PenHandleOverlayUtil>('shape_handle')
						.getOverlays()
						.find((overlay) => overlay.props.handle.id === '0:point')
				: undefined
		this.editor.overlays.setHoveredOverlay(overlay?.id ?? null)
	}

	override onPointerMove(info: TLPointerEventInfo) {
		super.onPointerMove(info)
		this.updateClosingHandle()
	}

	override onPointerUp() {
		super.onPointerUp()
		this.updateClosingHandle()
	}

	override onPointerDown(info: TLPointerEventInfo) {
		if (info.button !== 0) return
		this.editor.overlays.setHoveredOverlay(null)
		let shape = this.shape
		if (shape) {
			const point = this.getPoint(shape)
			if (this.canClose(shape)) {
				this.editor.markHistoryStoppingPoint('close pen path')
				this.editor.updateShape<PenShape>({
					id: shape.id,
					type: 'pen-path',
					props: { closed: true },
				})
				this.editor.setCurrentTool('select')
				return
			}
			if (
				Vec.Dist(point, shape.props.points[shape.props.points.length - 1].point) <
				2 / this.editor.getZoomLevel()
			)
				return
		}
		const mark = this.editor.markHistoryStoppingPoint('add pen point')
		if (!shape) {
			const point = this.editor.inputs.getCurrentPagePoint()
			this.shapeId = createShapeId()
			this.editor.createShape<PenShape>({
				id: this.shapeId,
				type: 'pen-path',
				x: point.x,
				y: point.y,
			})
			this.editor.select(this.shapeId)
		} else {
			this.editor.updateShape<PenShape>({
				id: shape.id,
				type: 'pen-path',
				props: { points: [...shape.props.points, corner(this.getPoint(shape).toJson())] },
			})
		}
		shape = this.shape!
		this.startDrag(shape, shape.props.points.length - 1, 'out', mark, true)
	}

	override onExit() {
		super.onExit()
		this.editor.overlays.setHoveredOverlay(null)
		const shape = this.shape
		if (shape && shape.props.points.length < 2) this.editor.deleteShape(shape.id)
		this.shapeId = null
	}
}

class Editing extends PenInteraction {
	static override id = 'editing'

	override onEnter({ shapeId }: { shapeId: TLShapeId }) {
		this.shapeId = shapeId
		this.editor.select(shapeId).setCursor({ type: 'default', rotation: 0 })
	}

	override onCancel() {
		if (this.drag) this.editor.bailToMark(this.drag.mark)
		this.finish()
	}

	override onPointerMove(info: TLPointerEventInfo) {
		super.onPointerMove(info)
		if (!this.drag) this.updateHoveredHandle()
	}

	override onPointerUp() {
		super.onPointerUp()
		this.updateHoveredHandle()
	}

	override onExit() {
		super.onExit()
		this.editor.overlays.setHoveredOverlay(null)
	}

	private updateHoveredHandle() {
		const shape = this.shape
		const overlay = shape && this.getHandleOverlay(shape)
		this.editor.overlays.setHoveredOverlay(overlay?.id ?? null)
		this.editor.setHoveredShape(null)
		const cursor = overlay && this.editor.overlays.getOverlayUtil(overlay).getCursor(overlay)
		this.editor.setCursor({ type: cursor ?? 'default', rotation: 0 })
	}

	override onPointerDown(info: TLPointerEventInfo) {
		if (info.button !== 0) return
		const shape = this.shape
		if (!shape || this.editor.isShapeOrAncestorLocked(shape)) return this.finish()
		const handle = this.getHandleOverlay(shape)?.props.handle
		if (!handle) {
			if (
				!this.editor.isPointInShape(shape, this.editor.inputs.getCurrentPagePoint(), {
					margin: 8 / this.editor.getZoomLevel(),
					hitInside: true,
				})
			)
				this.finish()
			return
		}
		const [indexString, part] = handle.id.split(':') as [string, HandlePart]
		const index = Number(indexString)
		const points = [...shape.props.points]
		const node = points[index]
		if (part === 'point' && info.accelKey) {
			if (points.length <= 2) return
			this.editor.markHistoryStoppingPoint('remove pen point')
			points.splice(index, 1)
			this.editor.updateShape<PenShape>({
				id: shape.id,
				type: 'pen-path',
				props: { points, closed: shape.props.closed && points.length >= 3 },
			})
			return
		}
		if (part === 'point' && info.altKey) {
			this.editor.markHistoryStoppingPoint('toggle pen handles')
			const previous = points[index - 1] ?? (shape.props.closed ? points[points.length - 1] : node)
			const next = points[index + 1] ?? (shape.props.closed ? points[0] : node)
			const tangent = Vec.Sub(next.point, previous.point).div(6)
			points[index] =
				Vec.Len(node.in) || Vec.Len(node.out)
					? corner(node.point)
					: { ...node, in: Vec.Mul(tangent, -1).toJson(), out: tangent.toJson(), smooth: true }
			this.editor.updateShape<PenShape>({ id: shape.id, type: 'pen-path', props: { points } })
			return
		}
		this.startDrag(shape, index, part, this.editor.markHistoryStoppingPoint('move pen handle'))
	}

	override onDoubleClick(info: TLClickEventInfo) {
		if (info.phase !== 'down') return
		const shape = this.shape
		if (!shape || this.getHandleOverlay(shape)) return
		const points = insertPenPoint(shape, this.getPoint(shape), 10 / this.editor.getZoomLevel())
		if (!points) return
		this.editor.markHistoryStoppingPoint('insert pen point')
		this.editor.updateShape<PenShape>({ id: shape.id, type: 'pen-path', props: { points } })
	}
}

export class PenTool extends StateNode {
	static override id = 'pen'
	static override initial = 'drawing'
	static override children() {
		return [Drawing, Editing]
	}
	override shapeType = 'pen-path'
}

/*
[1] Both states use shape-local pointer coordinates, so point editing also works after rotation
    and inside frames. Every gesture starts a history mark; Escape during a drag rolls back to it.
    Points live in the store, rather than a tool-local copy, so undo/redo can restore them.
*/
