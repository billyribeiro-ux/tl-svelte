import { shapeView, type SvgExportContext } from '@svelte-draw/editor'
import { flushSync } from 'svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestEditor, flush, mountInEditor } from '../../../test/svelte/helpers'
import { getFillDefForCanvas, getFillDefForExport } from './defaultStyleDefs'
import { getPatternLodsToGenerate } from './hashPatternUtils'
import PatternFill from './PatternFill.svelte'

let test: ReturnType<typeof createTestEditor>
const mounted: { unmount(): void }[] = []

beforeEach(() => {
	test = createTestEditor()
})

afterEach(() => {
	for (const m of mounted.splice(0)) m.unmount()
	test.dispose()
})

function mountFill(
	props: Record<string, unknown> = {},
	svgExport?: SvgExportContext,
	idScope = true
) {
	const m = mountInEditor(
		test,
		PatternFill,
		{ d: 'M 0 0 L 10 10', fillColor: 'red', patternFillFallbackColor: 'blue', ...props },
		svgExport,
		idScope
	)
	mounted.push(m)
	return m.target
}

const exportContext = (colorMode: 'light' | 'dark') => ({ colorMode }) as SvgExportContext

describe('PatternFill', () => {
	it('draws the fill color and the shared hash pattern at the current zoom', () => {
		const target = mountFill()
		const paths = target.querySelectorAll('path')
		expect(paths).toHaveLength(2)
		expect(paths[0].getAttribute('fill')).toBe('red')
		expect(paths[0].getAttribute('d')).toBe('M 0 0 L 10 10')
		expect(paths[1].getAttribute('d')).toBe('M 0 0 L 10 10')
		expect(paths[1].getAttribute('fill')).toMatch(/^url\(#tl_\w+_hash_pattern_light_0\)$/)
		expect(target.querySelector('pattern')).toBeNull()
	})

	it('picks a higher level of detail when zoomed in', async () => {
		const target = mountFill()
		test.editor.setCamera({ x: 0, y: 0, z: 4 })
		await flush()
		expect(target.querySelectorAll('path')[1].getAttribute('fill')).toMatch(
			/_hash_pattern_light_2\)$/
		)
	})

	it('uses the dark pattern in dark mode', async () => {
		const target = mountFill()
		// user preferences are global: put them back afterwards
		const original = test.editor.user.getUserPreferences().colorScheme
		try {
			test.editor.user.updateUserPreferences({ colorScheme: 'dark' })
			await flush()
			expect(target.querySelectorAll('path')[1].getAttribute('fill')).toMatch(
				/_hash_pattern_dark_0\)$/
			)
		} finally {
			test.editor.user.updateUserPreferences({ colorScheme: original })
		}
	})

	it('falls back to a flat color when the pattern would be too small to see', async () => {
		const target = mountFill()
		test.editor.setCamera({ x: 0, y: 0, z: 0.1 })
		await flush()
		expect(target.querySelectorAll('path')[1].getAttribute('fill')).toBe('blue')
		expect(target.querySelector('pattern')).toBeNull()
	})

	it('scales the pattern with its own <pattern> when scale is not 1', () => {
		const target = mountFill({ scale: 2 })
		const pattern = target.querySelector('pattern')!
		expect(pattern.getAttribute('patternTransform')).toBe('scale(2)')
		expect(pattern.getAttribute('href')).toMatch(/^#tl_\w+_hash_pattern_light_1$/)
		const scaledId = pattern.getAttribute('id')!
		expect(target.querySelectorAll('path')[1].getAttribute('fill')).toBe(`url(#${scaledId})`)
	})

	it('references the unscaled pattern of the export color mode when exporting', () => {
		const target = mountFill({ scale: 2 }, exportContext('dark'))
		expect(target.querySelector('pattern')).toBeNull()
		expect(target.querySelectorAll('path')[1].getAttribute('fill')).toMatch(
			/_hash_pattern_dark_0\)$/
		)
	})
})

describe('hash pattern definitions', () => {
	it('defines the export pattern under the id PatternFill references, without an id scope', async () => {
		const def = getFillDefForExport('pattern')
		const view = (await def.getElement())!
		const defs = mountInEditor(
			test,
			view.component as any,
			view.props,
			exportContext('light'),
			false
		)
		mounted.push(defs)
		const pattern = defs.target.querySelector('pattern')!
		const maskId = defs.target.querySelector('mask')!.getAttribute('id')!
		expect(pattern.querySelector('rect')!.getAttribute('mask')).toBe(`url(#${maskId})`)

		const fill = mountFill({}, exportContext('light'), false)
		expect(fill.querySelectorAll('path')[1].getAttribute('fill')).toBe(
			`url(#${pattern.getAttribute('id')})`
		)
	})

	it('only defines a pattern for the pattern fill', async () => {
		expect(await getFillDefForExport('solid').getElement()).toBeNull()
		expect(await getFillDefForExport('pattern').getElement()).not.toBeNull()
		expect(getFillDefForExport('pattern').key).toBe(
			getFillDefForExport('solid').key.replace(/solid$/, 'pattern')
		)
	})

	it('defines a pattern for every level of detail and theme on the canvas', async () => {
		const def = getFillDefForCanvas()
		expect(def.key).toMatch(/:pattern$/)
		const defs = mountInEditor(test, def.view.component as any, def.view.props)
		mounted.push(defs)
		await flush()
		flushSync()
		const g = defs.target.querySelector('g')!
		expect(g.getAttribute('data-testid')).toBe('ready-pattern-fill-defs')
		const steps = test.editor.getCameraOptions().zoomSteps
		const lods = getPatternLodsToGenerate(steps[steps.length - 1] / steps[0])
		const patterns = [...g.querySelectorAll('pattern')]
		expect(patterns).toHaveLength(lods.length * 2)
		expect(patterns[0].getAttribute('id')).toMatch(/_hash_pattern_light_0$/)
		expect(patterns[1].getAttribute('id')).toMatch(/_hash_pattern_dark_0$/)
		expect(patterns[0].getAttribute('patternUnits')).toBe('userSpaceOnUse')
		expect(patterns[0].getAttribute('width')).toBe('8')
		expect(patterns[0].querySelector('image')).not.toBeNull()
	})

	it('wraps the definition in a shape view', () => {
		expect(getFillDefForCanvas().view).toEqual(shapeView(getFillDefForCanvas().view.component, {}))
	})
})
