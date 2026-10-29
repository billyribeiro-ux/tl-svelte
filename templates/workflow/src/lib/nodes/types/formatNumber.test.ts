import { describe, expect, it } from 'vitest'
import { formatNumber } from './formatNumber'

describe('formatNumber', () => {
	it('handles zero and non-finite values', () => {
		expect(formatNumber(0)).toBe('0')
		expect(formatNumber(Infinity)).toBe('Infinity')
		expect(formatNumber(NaN)).toBe('NaN')
	})

	it('uses suffixes for large numbers', () => {
		expect(formatNumber(1_500)).toBe('1.50k')
		expect(formatNumber(2_500_000)).toBe('2.50M')
		expect(formatNumber(-3_000_000_000)).toBe('-3.00B')
	})

	it('trims trailing zeros for numbers of at least one', () => {
		expect(formatNumber(1)).toBe('1')
		expect(formatNumber(12.5)).toBe('12.5')
		expect(formatNumber(-7)).toBe('-7')
	})

	it('uses three significant figures between 0.001 and 1, and exponents below that', () => {
		expect(formatNumber(0.5)).toBe('0.500')
		expect(formatNumber(0.0001234)).toBe('1.23e-4')
	})
})
