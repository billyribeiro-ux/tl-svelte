import z from 'zod'

export const SimpleShapeIdSchema = z.string().brand('simpleShapeId')
export type SimpleShapeId = z.infer<typeof SimpleShapeIdSchema>

export type SimpleShapeIdKey = `${SimpleShapeId}_${string}`

export const SvelteDrawShapeIdSchema = z.string().brand('SvelteDrawShapeId')
export type SvelteDrawShapeId = z.infer<typeof SvelteDrawShapeIdSchema>

export function toSvelteDrawShapeId(id: SimpleShapeId): SvelteDrawShapeId {
	return `shape:${id}` as SvelteDrawShapeId
}

export function toSimpleShapeId(id: string): SimpleShapeId {
	if (id.startsWith('shape:')) throw new Error('Invalid simple shape id')
	return id as SimpleShapeId
}

export const TodoIdSchema = z.number().brand('todoId')
export type TodoId = z.infer<typeof TodoIdSchema>
