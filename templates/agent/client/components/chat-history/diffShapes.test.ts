import type { RecordsDiff, TLRecord, TLShape } from 'svelte-draw'
import { describe, expect, it } from 'vitest'
import { getDiffShapesFromDiff } from './diffShapes'

function shape(id: string, props: Record<string, unknown>, opacity = 1): TLShape {
	return {
		id,
		typeName: 'shape',
		type: 'geo',
		opacity,
		meta: {},
		props,
	} as unknown as TLShape
}

const empty = (): RecordsDiff<TLRecord> => ({ added: {}, updated: {}, removed: {} })

describe('getDiffShapesFromDiff', () => {
	it('marks added, removed and updated shapes with a changeType and normalises dash', () => {
		const diff = empty()
		const added = shape('shape:a', { dash: 'dotted' })
		const removed = shape('shape:r', { dash: 'dashed' })
		const before = shape('shape:u', { dash: 'draw', fill: 'solid' })
		const after = shape('shape:u', { dash: 'dotted', fill: 'solid' }, 0.5)
		diff.added[added.id as never] = added as never
		diff.removed[removed.id as never] = removed as never
		diff.updated[before.id as never] = [before, after] as never

		const result = getDiffShapesFromDiff(diff)

		// order: removed, updated (before, after), added
		expect(result.map((s) => s.meta.changeType)).toEqual([
			'delete-shadow',
			'update-before-shadow',
			'update-after-shadow',
			'create-shadow',
		])
		expect((result[0].props as { dash: string }).dash).toBe('solid')
		// the "before" copy gets a distinct id, half the new opacity, a dashed outline and no fill
		expect(result[1].id).toBe('shape:u-before')
		expect(result[1].opacity).toBe(0.25)
		expect(result[1].props).toMatchObject({ dash: 'dashed', fill: 'none' })
		expect(result[2].props).toMatchObject({ dash: 'solid' })
		expect((result[3].props as { dash: string }).dash).toBe('solid')
	})

	it('drops shadows and halves the opacity of removed shapes when the diff is large', () => {
		const diff = empty()
		for (let i = 0; i < 20; i++) {
			const s = shape(`shape:${i}`, {}, 0.8)
			diff.removed[s.id as never] = s as never
		}
		const result = getDiffShapesFromDiff(diff)
		expect(result).toHaveLength(20)
		expect(result[0].meta.changeType).toBe('delete')
		expect(result[0].opacity).toBeCloseTo(0.4)
	})

	it('ignores non-shape records', () => {
		const diff = empty()
		diff.added['page:p' as never] = { id: 'page:p', typeName: 'page' } as never
		expect(getDiffShapesFromDiff(diff)).toEqual([])
	})
})
