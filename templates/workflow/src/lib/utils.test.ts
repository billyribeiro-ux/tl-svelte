import { describe, expect, it } from 'vitest'
import { appendToIndexList, indexList, indexListEntries, indexListLength } from './utils'

describe('index lists', () => {
	it('turns an array into an ordered list of fractional-index entries', () => {
		const list = indexList([10, 20, 30])
		expect(indexListLength(list)).toBe(3)
		expect(indexListEntries(list).map(([, value]) => value)).toEqual([10, 20, 30])
	})

	it('appends after the last entry without changing existing keys', () => {
		const list = indexList([1, 2])
		const before = indexListEntries(list)
		const appended = appendToIndexList(list, 3)
		const after = indexListEntries(appended)
		expect(after.slice(0, 2)).toEqual(before)
		expect(after[2][1]).toBe(3)
		expect(after[2][0] > before[1][0]).toBe(true)
	})

	it('appends to an empty list', () => {
		expect(indexListEntries(appendToIndexList({}, 7)).map(([, v]) => v)).toEqual([7])
	})
})
