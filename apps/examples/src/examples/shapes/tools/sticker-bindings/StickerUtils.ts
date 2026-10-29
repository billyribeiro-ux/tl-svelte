import {
	type BindingOnShapeChangeOptions,
	type BindingOnShapeDeleteOptions,
	BindingUtil,
	Box,
	type RecordProps,
	Rectangle2d,
	ShapeUtil,
	StateNode,
	type TLBinding,
	type TLPointerEventInfo,
	type TLShape,
	type VecModel,
	createShapeId,
	invLerp,
	lerp,
	shapeView,
} from 'svelte-draw'
import StickerShapeComponent from './StickerShape.svelte'

export const STICKER_TYPE = 'sticker'

declare module 'svelte-draw' {
	export interface TLGlobalShapePropsMap {
		[STICKER_TYPE]: Record<string, never>
	}
}

// There's a guide at the bottom of this file!

type StickerShape = TLShape<typeof STICKER_TYPE>

// [1]
const offsetX = -16
const offsetY = -26
export class StickerShapeUtil extends ShapeUtil<StickerShape> {
	static override type = STICKER_TYPE
	static override props: RecordProps<StickerShape> = {}

	override getDefaultProps() {
		return {}
	}

	// [2]
	override canBind() {
		return true
	}
	override canResize(_shape: StickerShape) {
		return false
	}
	override canSnap(_shape: StickerShape) {
		return false
	}
	override hideRotateHandle(_shape: StickerShape) {
		return true
	}

	override getGeometry() {
		return new Rectangle2d({
			width: 32,
			height: 32,
			x: offsetX,
			y: offsetY,
			isFilled: true,
		})
	}

	override component() {
		return shapeView(StickerShapeComponent, { offsetX, offsetY })
	}

	override getIndicatorPath() {
		const path = new Path2D()
		path.rect(offsetX, offsetY, 32, 32)
		return path
	}

	// [3]
	override onTranslateStart(shape: StickerShape) {
		const bindings = this.editor.getBindingsFromShape(shape, STICKER_TYPE)
		this.editor.deleteBindings(bindings)
	}

	override onTranslateEnd(_initial: StickerShape, sticker: StickerShape) {
		const pageAnchor = this.editor.getShapePageTransform(sticker).applyToPoint({ x: 0, y: 0 })
		const target = this.editor.getShapeAtPoint(pageAnchor, {
			hitInside: true,
			filter: (shape) =>
				shape.id !== sticker.id &&
				this.editor.canBindShapes({ fromShape: sticker, toShape: shape, binding: STICKER_TYPE }),
		})

		if (!target) return

		const targetBounds = Box.ZeroFix(this.editor.getShapeGeometry(target)!.bounds)
		const pointInTargetSpace = this.editor.getPointInShapeSpace(target, pageAnchor)

		const anchor = {
			x: invLerp(targetBounds.minX, targetBounds.maxX, pointInTargetSpace.x),
			y: invLerp(targetBounds.minY, targetBounds.maxY, pointInTargetSpace.y),
		}

		this.editor.createBinding({
			type: STICKER_TYPE,
			fromId: sticker.id,
			toId: target.id,
			props: {
				anchor,
			},
		})
	}
}

declare module 'svelte-draw' {
	export interface TLGlobalBindingPropsMap {
		[STICKER_TYPE]: {
			anchor: VecModel
		}
	}
}

type StickerBinding = TLBinding<typeof STICKER_TYPE>

export class StickerBindingUtil extends BindingUtil<StickerBinding> {
	static override type = STICKER_TYPE

	override getDefaultProps() {
		return {
			anchor: { x: 0.5, y: 0.5 },
		}
	}

	// [4]
	override onAfterChangeToShape({
		binding,
		shapeAfter,
	}: BindingOnShapeChangeOptions<StickerBinding>): void {
		const sticker = this.editor.getShape<StickerShape>(binding.fromId)!

		const shapeBounds = this.editor.getShapeGeometry(shapeAfter)!.bounds
		const shapeAnchor = {
			x: lerp(shapeBounds.minX, shapeBounds.maxX, binding.props.anchor.x),
			y: lerp(shapeBounds.minY, shapeBounds.maxY, binding.props.anchor.y),
		}
		const pageAnchor = this.editor.getShapePageTransform(shapeAfter).applyToPoint(shapeAnchor)

		const stickerParentAnchor = this.editor
			.getShapeParentTransform(sticker)
			.invert()
			.applyToPoint(pageAnchor)

		this.editor.updateShape({
			id: sticker.id,
			type: STICKER_TYPE,
			x: stickerParentAnchor.x,
			y: stickerParentAnchor.y,
		})
	}

	override onBeforeDeleteToShape({ binding }: BindingOnShapeDeleteOptions<StickerBinding>): void {
		this.editor.deleteShape(binding.fromId)
	}
}

// [5]
export class StickerTool extends StateNode {
	static override id = 'sticker'

	override onEnter() {
		this.editor.setCursor({ type: 'cross', rotation: 0 })
	}

	override onPointerDown(info: TLPointerEventInfo) {
		const currentPagePoint = this.editor.inputs.getCurrentPagePoint()
		const stickerId = createShapeId()
		this.editor.markHistoryStoppingPoint()
		this.editor.createShape({
			id: stickerId,
			type: STICKER_TYPE,
			x: currentPagePoint.x,
			y: currentPagePoint.y,
		})
		this.editor.setSelectedShapes([stickerId])
		this.editor.setCurrentTool('select.translating', {
			...info,
			target: 'shape',
			shape: this.editor.getShape(stickerId),
			isCreating: true,
			onInteractionEnd: 'sticker',
			onCreate: () => {
				this.editor.setCurrentTool('sticker')
			},
		})
	}
}

/*
A sticker is a small shape that, when dropped on another shape, creates a `sticker` binding
to it. The binding keeps the sticker in place on the target as the target moves, resizes, or
rotates, and deletes the sticker when the target is deleted.

[1]
The sticker shape has no props (StickerShape.svelte renders the emoji). Its geometry, component, and indicator are offset so the
shape's origin (0,0) sits at the bottom of the heart, which is the point that gets bound to
the target shape.

[2]
`canBind` returning true lets stickers bind to (and be bound by) anything. The other overrides
make the sticker behave like a decal: no resizing, rotating, or snapping.

[3]
Dragging a sticker unsticks it: `onTranslateStart` deletes its bindings. On `onTranslateEnd`
we look for a shape under the sticker's origin and, if there is one, create a binding to it.
The sticker's position is stored as a normalized anchor within the target's bounds so it
survives resizing.

[4]
When the target shape changes, convert the stored anchor back to a page point and move the
sticker there (in the sticker's parent space, in case it lives in a frame or group).

[5]
The sticker tool creates a sticker at the pointer and immediately hands off to the select
tool's translating state, so the sticker follows the pointer until pointer up. `onInteractionEnd:
'sticker'` masks the current tool id as 'sticker' during the drag (and returns to the sticker
tool afterwards when the tool is locked); `onTranslateEnd` in the shape util does the binding.
*/
