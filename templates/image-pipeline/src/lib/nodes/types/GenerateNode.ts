import { T } from 'svelte-draw'
import { apiGenerate } from '../../api/pipelineApi'
import { GenerateIcon } from '../../components/icons/icons.svelte'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_IMAGE_PREVIEW_HEIGHT_PX,
	NODE_ROW_HEADER_GAP_PX,
	NODE_ROW_HEIGHT_PX,
	NODE_WIDTH_PX,
} from '../../constants'
import type { ShapePort } from '../../ports/Port'
import type { NodeShape } from '../NodeShapeUtil'
import GenerateNodeComponent from './GenerateNodeComponent.svelte'
import type { ExecutionResult, InfoValues, InputValues } from './shared'
import { areAnyInputsOutOfDate, NodeDefinition, updateNode } from './shared'

export type GenerateNode = T.TypeOf<typeof GenerateNode>
export const GenerateNode = T.object({
	type: T.literal('generate'),
	steps: T.number,
	cfgScale: T.number,
	seed: T.number,
	lastResultUrl: T.string.nullable(),
})

export class GenerateNodeDefinition extends NodeDefinition<GenerateNode> {
	static type = 'generate'
	static validator = GenerateNode
	title = 'Generate'
	heading = 'Generate'
	icon = GenerateIcon
	category = 'process'
	resultKeys = ['lastResultUrl'] as const
	getDefault(): GenerateNode {
		return {
			type: 'generate',
			steps: 20,
			cfgScale: 7,
			seed: Math.floor(Math.random() * 99999),
			lastResultUrl: null,
		}
	}
	getBodyHeightPx() {
		// 4 port rows + image preview + 3 parameter rows
		return NODE_ROW_HEIGHT_PX * 7 + NODE_IMAGE_PREVIEW_HEIGHT_PX
	}
	getPorts(_shape: NodeShape, _node: GenerateNode): Record<string, ShapePort> {
		const baseY = NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX
		return {
			model: {
				id: 'model',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 0.5,
				terminal: 'end',
				dataType: 'model',
			},
			prompt: {
				id: 'prompt',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 1.5,
				terminal: 'end',
				dataType: 'text',
				multi: true,
			},
			negative: {
				id: 'negative',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 2.5,
				terminal: 'end',
				dataType: 'text',
			},
			image: {
				id: 'image',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 3.5,
				terminal: 'end',
				dataType: 'image',
			},
			output: {
				id: 'output',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX / 2,
				terminal: 'start',
				dataType: 'image',
			},
		}
	}
	async execute(
		shape: NodeShape,
		node: GenerateNode,
		inputs: InputValues
	): Promise<ExecutionResult> {
		const model = (inputs.model as string) ?? 'flux:flux-dev'
		const rawPrompt = inputs.prompt
		const promptValues = Array.isArray(rawPrompt) ? rawPrompt : [rawPrompt ?? 'default']
		const prompt =
			promptValues
				.filter((v) => v != null)
				.map(String)
				.join(', ') || 'default'
		const negativePrompt = inputs.negative as string | undefined
		const referenceImageUrl = (inputs.image as string) ?? undefined

		const result = await apiGenerate({
			model,
			prompt,
			negativePrompt: negativePrompt ?? undefined,
			steps: node.steps,
			cfgScale: node.cfgScale,
			seed: node.seed,
			referenceImageUrl,
		})

		updateNode<GenerateNode>(this.editor, shape, (n) => ({
			...n,
			lastResultUrl: result.imageUrl,
		}))

		return { output: result.imageUrl }
	}
	getOutputInfo(shape: NodeShape, node: GenerateNode, inputs: InfoValues): InfoValues {
		return {
			output: {
				value: node.lastResultUrl,
				isOutOfDate: areAnyInputsOutOfDate(inputs) || shape.props.isOutOfDate,
				dataType: 'image',
			},
		}
	}
	Component = GenerateNodeComponent
}
