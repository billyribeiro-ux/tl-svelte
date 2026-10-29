import { T, type TLShapeId } from 'svelte-draw'

export type PortId = string

export const shapePort = T.object({
	id: T.string,
	terminal: T.literalEnum('start', 'end'),
	x: T.number,
	y: T.number,
})

export type ShapePort = T.TypeOf<typeof shapePort>

/**
 * Port ids are unique within a shape. To identify a port we need both the shape id and the port id.
 */
export interface PortIdentifier {
	shapeId: TLShapeId
	portId: PortId
}
