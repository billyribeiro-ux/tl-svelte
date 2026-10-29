import { View } from '@svelte-draw/svelte'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, describe, expect, it } from 'vitest'
import { createTestEditor } from '../../../test/svelte/helpers'
import { createTextJsxFromSpans } from './createTextJsxFromSpans'

const mounted: ReturnType<typeof mount>[] = []
afterEach(() => {
	for (const m of mounted.splice(0)) unmount(m)
})

const baseOpts = {
	overflow: 'wrap' as const,
	width: 200,
	height: 100,
	padding: 4,
	fontSize: 20,
	fontWeight: 'bold',
	fontFamily: 'Foo',
	fontStyle: 'italic',
	lineHeight: 1.5,
	textAlign: 'start' as const,
	verticalTextAlign: 'start' as const,
	offsetX: 10,
	offsetY: 2,
}

function render(view: ReturnType<typeof createTextJsxFromSpans>) {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	document.body.appendChild(svg)
	mounted.push(mount(View, { target: svg, props: { view } }))
	flushSync()
	const text = svg.querySelector('text')
	svg.remove()
	return text
}

describe('createTextJsxFromSpans', () => {
	const test = createTestEditor()

	it('returns null when there are no spans', () => {
		expect(createTextJsxFromSpans(test.editor, [], baseOpts)).toBeNull()
	})

	it('builds a <text> with one tspan per span, offset by padding, and a break tspan between lines', () => {
		const text = render(
			createTextJsxFromSpans(
				test.editor,
				[
					{ text: 'a b', box: { x: 0, y: 0, w: 30, h: 24 } },
					{ text: 'c', box: { x: 0, y: 24, w: 10, h: 24 } },
				],
				{ ...baseOpts, stroke: 'blue', strokeWidth: 3, fill: 'green' }
			)
		)!
		expect(text.getAttribute('font-size')).toBe('20')
		expect(text.getAttribute('font-family')).toBe('Foo')
		expect(text.getAttribute('font-style')).toBe('italic')
		expect(text.getAttribute('font-weight')).toBe('bold')
		expect(text.getAttribute('dominant-baseline')).toBe('mathematical')
		expect(text.getAttribute('alignment-baseline')).toBe('mathematical')
		expect(text.getAttribute('stroke')).toBe('blue')
		expect(text.getAttribute('stroke-width')).toBe('3')
		expect(text.getAttribute('fill')).toBe('green')

		// offsetX = padding + opts.offsetX = 14; offsetY = opts.offsetY + fontSize / 2 + padding = 16
		const tspans = [...text.querySelectorAll('tspan')]
		expect(tspans).toHaveLength(3)
		expect(tspans.map((t) => [t.getAttribute('x'), t.getAttribute('y')])).toEqual([
			['14', '16'],
			['14', '40'], // line break span, at the start of the next line
			['14', '40'],
		])
		expect(tspans.map((t) => t.getAttribute('alignment-baseline'))).toEqual([
			'mathematical',
			'mathematical',
			'mathematical',
		])
		// regular spans carry unicode-bidi; the line break span does not
		expect(tspans.map((t) => t.getAttribute('unicode-bidi'))).toEqual([
			'plaintext',
			null,
			'plaintext',
		])
		// spaces become non-breaking spaces; the break span holds a newline
		expect(tspans.map((t) => t.textContent)).toEqual(['a\xa0b', '\n', 'c'])
	})

	it('positions the text for end and middle vertical alignment', () => {
		const spans = [{ text: 'a', box: { x: 0, y: 0, w: 10, h: 24 } }]
		const yFor = (verticalTextAlign: 'start' | 'middle' | 'end') =>
			render(createTextJsxFromSpans(test.editor, spans, { ...baseOpts, verticalTextAlign }))!
				.querySelector('tspan')!
				.getAttribute('y')
		expect(yFor('start')).toBe('16') // 2 + 10 + 4
		expect(yFor('middle')).toBe(String(2 + 10 + (100 - 24) / 2))
		expect(yFor('end')).toBe(String(2 + 10 + (100 - 4 - 24)))
	})
})
