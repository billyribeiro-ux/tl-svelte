import type { ShapeView } from '@svelte-draw/editor'
import { View } from '@svelte-draw/svelte'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach } from 'vitest'
import { PathBuilder } from './PathBuilder'

const mounted: ReturnType<typeof mount>[] = []
afterEach(() => {
	for (const m of mounted.splice(0)) unmount(m)
})

/** Mounts a ShapeView inside an <svg> and returns the svg's serialized children. */
function renderSvg(view: ShapeView | null) {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	document.body.appendChild(svg)
	mounted.push(mount(View, { target: svg, props: { view } }))
	flushSync()
	// Svelte leaves empty comment anchors between blocks; they aren't part of the output.
	const html = svg.innerHTML.replace(/<!---->/g, '')
	svg.remove()
	return html
}

describe('PathBuilder', () => {
	describe('transform', () => {
		it('mirrors a path horizontally within a box while preserving command metadata', () => {
			const path = new PathBuilder()
				.moveTo(10, 0, { geometry: { isFilled: true } })
				.lineTo(100, 0)
				.lineTo(90, 80)
				.close()

			// mirror around the horizontal center of a 100-wide box: x' = 100 - x
			const mirrored = path.transform({ a: -1, b: 0, c: 0, d: 1, e: 100, f: 0 })

			expect(mirrored.toD()).toBe('M 90 0 L 0 0 L 10 80 Z')
			// original is untouched
			expect(path.toD()).toBe('M 10 0 L 100 0 L 90 80 Z')
			// fill metadata carried over
			const firstCommand = mirrored.commands[0]
			expect(firstCommand.type).toBe('move')
			if (firstCommand.type === 'move') {
				expect(firstCommand.opts?.geometry).toEqual({ isFilled: true })
			}
		})

		it('transforms bezier control points too', () => {
			const path = new PathBuilder().moveTo(0, 0).cubicBezierTo(100, 0, 20, 40, 80, 40)

			const mirrored = path.transform({ a: -1, b: 0, c: 0, d: 1, e: 100, f: 0 })

			expect(mirrored.toD()).toBe('M 100 0 C 80 40 20 40 0 0')
		})
	})

	describe('toSvg', () => {
		it('should build an SVG path', () => {
			const path = new PathBuilder()
				.moveTo(0, 0)
				.lineTo(100, 100)
				.lineTo(100, 0)
				.circularArcTo(50, false, false, 100, 100)
				.toSvg({ strokeWidth: 1, style: 'solid' })

			expect(renderSvg(path)).toMatchInlineSnapshot(
				`"<path stroke-width="1" d="M 0 0 L 100 100 L 100 0 C 72.3858 0 50 22.3858 50 50 C 50 77.6142 72.3858 100 100 100"></path>"`
			)

			const closed = new PathBuilder()
				.moveTo(0, 0)
				.lineTo(100, 100)
				.lineTo(100, 0)
				.circularArcTo(50, false, false, 0, 100)
				.close()
				.toSvg({ strokeWidth: 1, style: 'solid' })

			expect(renderSvg(closed)).toMatchInlineSnapshot(
				`"<path stroke-width="1" d="M 0 0 L 100 100 L 100 0 C 72.3858 -27.6142 27.6142 -27.6142 0 0 C -27.6142 27.6142 -27.6142 72.3858 0 100 Z"></path>"`
			)
		})
		it('should support dashed paths', () => {
			const path = new PathBuilder()
				.moveTo(0, 0)
				.lineTo(100, 100)
				.lineTo(100, 0)
				.circularArcTo(50, false, false, 0, 100)
				.toSvg({ strokeWidth: 1, style: 'dashed' })

			expect(renderSvg(path)).toMatchInlineSnapshot(
				`"<g stroke-width="1"><path d="M 0 0 L 100 100" stroke-dasharray="2.034590803390136 2.0944317093721985" stroke-dashoffset="0"></path><path d="M 100 100 L 100 0" stroke-dasharray="2.04 2.125" stroke-dashoffset="1"></path><path d="M 100 0 C 72.3858 -27.6142 27.6142 -27.6142 0 0 C -27.6142 27.6142 -27.6142 72.3858 0 100" stroke-dasharray="2.028867081195371 2.0664386938101" stroke-dashoffset="1"></path></g>"`
			)
			const closed = new PathBuilder()
				.moveTo(0, 0)
				.lineTo(100, 100)
				.lineTo(100, 0)
				.circularArcTo(50, false, false, 0, 100)
				.close()
				.toSvg({ strokeWidth: 1, style: 'dashed' })

			expect(renderSvg(closed)).toMatchInlineSnapshot(
				`"<g stroke-width="1"><path d="M 0 0 L 100 100" stroke-dasharray="2.04887651767585 2.10913759172514" stroke-dashoffset="1"></path><path d="M 100 100 L 100 0" stroke-dasharray="2.04 2.125" stroke-dashoffset="1"></path><path d="M 100 0 C 72.3858 -27.6142 27.6142 -27.6142 0 0 C -27.6142 27.6142 -27.6142 72.3858 0 100" stroke-dasharray="2.001565883316882 2.03795799028628" stroke-dashoffset="1"></path><path d="M 0 100 L 0 0" stroke-dasharray="2.0399999999999996 2.1249999999999996" stroke-dashoffset="1"></path></g>"`
			)
		})
		it('should return null for the none style', () => {
			expect(
				new PathBuilder().moveTo(0, 0).lineTo(10, 10).toSvg({ strokeWidth: 1, style: 'none' })
			).toBeNull()
		})
		it('should pass extra attributes through to the path', () => {
			const svg = renderSvg(
				new PathBuilder()
					.moveTo(0, 0)
					.lineTo(10, 10)
					.toSvg({
						strokeWidth: 2,
						style: 'solid',
						props: { fill: 'none', 'stroke-linecap': 'round', 'marker-end': 'url(#m)' },
					})
			)
			expect(svg).toContain('stroke-width="2"')
			expect(svg).toContain('d="M 0 0 L 10 10"')
			expect(svg).toContain('fill="none"')
			expect(svg).toContain('stroke-linecap="round"')
			expect(svg).toContain('marker-end="url(#m)"')
		})
		it('should put group attributes on the dashed group and markers only on the first and last runs', () => {
			const svg = renderSvg(
				new PathBuilder()
					.moveTo(0, 0)
					.lineTo(100, 0)
					.lineTo(100, 100)
					.toSvg({
						strokeWidth: 1,
						style: 'dashed',
						props: { fill: 'none', 'marker-start': 'url(#s)', 'marker-end': 'url(#e)' },
					})
			)
			const holder = document.createElement('div')
			holder.innerHTML = `<svg>${svg}</svg>`
			const g = holder.querySelector('g')!
			expect(g.getAttribute('fill')).toBe('none')
			expect(g.getAttribute('stroke-width')).toBe('1')
			expect(g.hasAttribute('marker-start')).toBe(false)
			const paths = [...g.querySelectorAll('path')]
			expect(paths.map((p) => p.getAttribute('marker-start'))).toEqual(['url(#s)', null])
			expect(paths.map((p) => p.getAttribute('marker-end'))).toEqual([null, 'url(#e)'])
		})
		it('should support draw paths', () => {
			const path = new PathBuilder()
				.moveTo(0, 0)
				.lineTo(100, 100)
				.lineTo(100, 0)
				.circularArcTo(50, false, false, 0, 100)
				.toSvg({ strokeWidth: 10, style: 'draw', randomSeed: '123' })

			expect(renderSvg(path)).toMatchInlineSnapshot(
				`"<path stroke-width="10" d="M 1.1127 1.3198 L 93.8385 93.868 Q 100.9096 100.9391 100.9096 90.9391 L 98.8429 1.0539 C 70.8916 -27.0473 26.1201 -27.0473 -1.4942 0.567 C -25.8613 28.4081 -25.8613 73.1797 1.7529 100.7939 M 1.4332 1.4744 L 92.9725 92.6522 Q 100.0436 99.7233 100.0436 89.7233 L 100.9554 -0.296 C 72.6836 -26.9909 27.9121 -26.9909 0.2978 0.6234 C -29.073 25.7004 -29.073 70.4719 -1.4587 98.0862"></path>"`
			)
			const closed = new PathBuilder()
				.moveTo(0, 0)
				.lineTo(100, 100)
				.lineTo(100, 0)
				.circularArcTo(50, false, false, 0, 100)
				.close()
				.toSvg({ strokeWidth: 10, style: 'draw', randomSeed: '123' })

			expect(renderSvg(closed)).toMatchInlineSnapshot(
				`"<path stroke-width="10" d="M 8.1837 8.3908 L 93.8385 93.868 Q 100.9096 100.9391 100.9096 90.9391 L 98.8429 1.0539 C 70.8916 -27.0473 26.1201 -27.0473 -1.4942 0.567 C -25.8613 28.4081 -25.8613 73.1797 1.7529 100.7939 L 1.1127 11.3198 Q 1.1127 1.3198 8.1837 8.3908 M 8.5043 8.5454 L 92.9725 92.6522 Q 100.0436 99.7233 100.0436 89.7233 L 100.9554 -0.296 C 72.6836 -26.9909 27.9121 -26.9909 0.2978 0.6234 C -29.073 25.7004 -29.073 70.4719 -1.4587 98.0862 L 1.4332 11.4744 Q 1.4332 1.4744 8.5043 8.5454"></path>"`
			)
		})
	})

	describe('toGeometry', () => {
		it('should combine multiple lineTos into a single line', () => {
			const geometry = new PathBuilder()
				.moveTo(0, 0)
				.lineTo(100, 100)
				.lineTo(100, 0)
				.circularArcTo(50, false, false, 0, 100)
				.close()
				.toGeometry()

			expect(geometry?.toSimpleSvgPath()).toMatchInlineSnapshot(
				`"M0,0L100,100L100,0L84.92197106154207,-11.50593202657044L67.93757691512266,-18.409491194065584L50.000000178767834,-20.71067750830319L32.06242347050369,-18.409490975101022L15.078029408356239,-11.505931600276853L6.103515630684342e-7,6.103515559630068e-7L-11.505931600276849,15.078029408356231L-18.409490975101022,32.062423470503674L-20.710677508303192,50.00000017876782L-18.409491194065588,67.93757691512262L-11.50593202657045,84.92197106154204L-1.4210854715202004e-14,99.99999999999999L0,0Z"`
			)
		})
	})
})
