import { DefaultColorStyle, createShapeId, type Editor, type TLShape } from 'svelte-draw'

// [1]
export const DIRECTIONS = [
	{ name: 'up', dx: 0, dy: -1 },
	{ name: 'right', dx: 1, dy: 0 },
	{ name: 'down', dx: 0, dy: 1 },
	{ name: 'left', dx: -1, dy: 0 },
] as const

export type Direction = (typeof DIRECTIONS)[number]

export const GAP = 80
export const BUTTON_OFFSET = 24

// [2]
export function addConnectedShape(editor: Editor, shape: TLShape, direction: Direction) {
	const bounds = editor.getShapePageBounds(shape.id)
	if (!bounds) return

	editor.run(() => {
		editor.markHistoryStoppingPoint('add connected shape')

		// [3]
		editor.duplicateShapes([shape.id], {
			x: direction.dx * (bounds.width + GAP),
			y: direction.dy * (bounds.height + GAP),
		})

		// If duplication did nothing (e.g. a locked shape), the original is
		// still the only selected shape — don't connect it to itself.
		const newShape = editor.getOnlySelectedShape()
		if (!newShape || newShape.id === shape.id) return

		// [4]
		const color = editor.getShapeStyleIfExists(shape, DefaultColorStyle)

		const arrowId = createShapeId()
		editor.createShape({
			id: arrowId,
			type: 'arrow',
			x: bounds.center.x,
			y: bounds.center.y,
			props: color ? { color } : {},
		})

		editor.createBindings([
			{
				fromId: arrowId,
				toId: shape.id,
				type: 'arrow',
				props: {
					terminal: 'start',
					normalizedAnchor: { x: 0.5, y: 0.5 },
					isExact: false,
					isPrecise: false,
				},
			},
			{
				fromId: arrowId,
				toId: newShape.id,
				type: 'arrow',
				props: {
					terminal: 'end',
					normalizedAnchor: { x: 0.5, y: 0.5 },
					isExact: false,
					isPrecise: false,
				},
			},
		])
	})
}
