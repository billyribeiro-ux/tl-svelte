import { describe, expect, it } from 'vitest'
import { styleToString } from './styleToString'

describe('styleToString', () => {
	it('kebab-cases keys and adds px to lengths like React', () => {
		expect(
			styleToString({ fontSize: 12, minWidth: 0, width: 10.5, transformOrigin: 'top left' })
		).toBe('font-size: 12px; min-width: 0; width: 10.5px; transform-origin: top left;')
	})
	it('leaves unitless properties and custom properties alone', () => {
		expect(
			styleToString({ opacity: 0.5, lineHeight: 1.5, zIndex: 3, '--tl-rich-text-heading-line-height': 1.2 })
		).toBe('opacity: 0.5; line-height: 1.5; z-index: 3; --tl-rich-text-heading-line-height: 1.2;')
	})
	it('skips empty values and passes strings through', () => {
		expect(styleToString({ width: undefined, height: null, color: '', top: false, left: 1 })).toBe(
			'left: 1px;'
		)
		expect(styleToString('color: red')).toBe('color: red')
		expect(styleToString(undefined)).toBe('')
	})
	it('handles vendor prefixes', () => {
		expect(styleToString({ WebkitMask: 'none', msTransform: 'none' })).toBe(
			'-webkit-mask: none; -ms-transform: none;'
		)
	})
})
