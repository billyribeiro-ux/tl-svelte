import { T } from 'svelte-draw'
import { apiGenerate } from '../../api/pipelineApi'
import { ControlNetIcon } from '../../components/icons/icons.svelte'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_IMAGE_PREVIEW_HEIGHT_PX,
	NODE_ROW_HEADER_GAP_PX,
	NODE_ROW_HEIGHT_PX,
	NODE_WIDTH_PX,
} from '../../constants'
import type { ShapePort } from '../../ports/Port'
import type { NodeShape } from '../NodeShapeUtil'
import ControlNetNodeComponent from './ControlNetNodeComponent.svelte'
import type { ExecutionResult, InfoValues, InputValues } from './shared'
import { areAnyInputsOutOfDate, NodeDefinition, updateNode } from './shared'

export type ControlNetNode = T.TypeOf<typeof ControlNetNode>
export const ControlNetNode = T.object({
	type: T.literal('controlnet'),
	mode: T.string,
	strength: T.number,
	steps: T.number,
	lastResultUrl: T.string.nullable(),
})

export class ControlNetNodeDefinition extends NodeDefinition<ControlNetNode> {
	static type = 'controlnet'
	static validator = ControlNetNode
	title = 'ControlNet'
	heading = 'ControlNet'
	icon = ControlNetIcon
	category = 'process'
	resultKeys = ['lastResultUrl'] as const
	getDefault(): ControlNetNode {
		return {
			type: 'controlnet',
			mode: 'canny',
			strength: 75,
			steps: 20,
			lastResultUrl: null,
		}
	}
	getBodyHeightPx() {
		// model input + image input + prompt input + mode row + strength row + steps row + preview
		return NODE_ROW_HEIGHT_PX * 6 + NODE_IMAGE_PREVIEW_HEIGHT_PX
	}
	getPorts(): Record<string, ShapePort> {
		const baseY = NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX
		return {
			model: {
				id: 'model',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 0.5,
				terminal: 'end',
				dataType: 'model',
			},
			image: {
				id: 'image',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 1.5,
				terminal: 'end',
				dataType: 'image',
			},
			prompt: {
				id: 'prompt',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 2.5,
				terminal: 'end',
				dataType: 'text',
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
		node: ControlNetNode,
		inputs: InputValues
	): Promise<ExecutionResult> {
		const model = (inputs.model as string) ?? 'stable-diffusion:sdxl'
		const prompt = (inputs.prompt as string) ?? ''
		const referenceImageUrl = (inputs.image as string) ?? undefined

		const result = await apiGenerate({
			model,
			prompt,
			steps: node.steps,
			cfgScale: 7,
			controlNetMode: node.mode,
			controlNetStrength: node.strength,
			referenceImageUrl,
		})

		updateNode<ControlNetNode>(this.editor, shape, (n) => ({
			...n,
			lastResultUrl: result.imageUrl,
		}))
		return { output: result.imageUrl }
	}
	getOutputInfo(shape: NodeShape, node: ControlNetNode, inputs: InfoValues): InfoValues {
		return {
			output: {
				value: node.lastResultUrl,
				isOutOfDate: areAnyInputsOutOfDate(inputs) || shape.props.isOutOfDate,
				dataType: 'image',
			},
		}
	}
	Component = ControlNetNodeComponent
}
