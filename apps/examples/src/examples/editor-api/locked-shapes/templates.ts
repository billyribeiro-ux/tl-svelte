import { createShapeId, type TLShapeId } from 'svelte-draw'

export const TEMPLATE_IDS: TLShapeId[] = [
	createShapeId('t1'),
	createShapeId('t2'),
	createShapeId('t3'),
	createShapeId('t4'),
]

export const HOME_POSITIONS = [
	{ x: 100, y: 100 },
	{ x: 250, y: 100 },
	{ x: 100, y: 250 },
	{ x: 250, y: 250 },
]
