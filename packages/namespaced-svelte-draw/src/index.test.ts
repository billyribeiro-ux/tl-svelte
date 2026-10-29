import * as svelteDraw from './index'

it('exports things from svelte-draw', () => {
	expect(svelteDraw).toHaveProperty('SvelteDraw')
	expect(new svelteDraw.Vec()).toMatchObject({ x: 0, y: 0 })
})

it('exports types from svelte-draw', () => {
	const _thing: svelteDraw.VecModel = { x: 0, y: 0 }
})
