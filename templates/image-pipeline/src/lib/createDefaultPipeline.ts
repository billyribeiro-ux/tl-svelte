import { createShapeId, type Editor } from 'svelte-draw'

/**
 * Create a default text-to-image pipeline to get users started.
 */
export function createDefaultPipeline(editor: Editor) {
	const modelId = createShapeId()
	const promptId = createShapeId()
	const generateId = createShapeId()
	const previewId = createShapeId()

	editor.createShapes([
		{
			id: modelId,
			type: 'node',
			x: 100,
			y: 200,
			props: {
				node: { type: 'model', provider: 'flux', modelId: 'flux-dev' },
			},
		},
		{
			id: promptId,
			type: 'node',
			x: 100,
			y: 450,
			props: {
				node: {
					type: 'prompt',
					text: 'a photo of a cat sitting on a windowsill',
				},
			},
		},
		{
			id: generateId,
			type: 'node',
			x: 450,
			y: 200,
			props: {
				node: {
					type: 'generate',
					steps: 20,
					cfgScale: 7,
					seed: Math.floor(Math.random() * 99999),
					lastResultUrl: null,
				},
			},
		},
		{
			id: previewId,
			type: 'node',
			x: 800,
			y: 200,
			props: {
				node: {
					type: 'preview',
					lastImageUrl: null,
				},
			},
		},
	])
}
