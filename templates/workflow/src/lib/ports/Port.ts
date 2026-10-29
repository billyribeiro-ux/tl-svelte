import type { TLShapeId, VecModel } from 'svelte-draw'

export type PortId = string

/**
 * Port ids are unique within a shape. To identify a port we need both the shape id and the port id.
 */
export interface PortIdentifier {
	shapeId: TLShapeId
	portId: PortId
}

/**
 * Shapes define their ports with a position, id, and whether they're the start (an output) or end
 * (an input). of a connection.
 */
export interface ShapePort extends VecModel {
	id: PortId
	terminal: 'start' | 'end'
}
