import { T } from 'svelte-draw'
import { apiGenerateText } from '../../api/pipelineApi'
import { GenerateTextIcon } from '../../components/icons/icons.svelte'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_ROW_HEADER_GAP_PX,
	NODE_ROW_HEIGHT_PX,
	NODE_WIDTH_PX,
} from '../../constants'
import type { ShapePort } from '../../ports/Port'
import type { NodeShape } from '../NodeShapeUtil'
import GenerateTextNodeComponent from './GenerateTextNodeComponent.svelte'
import type { ExecutionResult, InfoValues, InputValues } from './shared'
import {
	areAnyInputsOutOfDate,
	coerceToText,
	getInput,
	getInputText,
	NodeDefinition,
	updateNode,
} from './shared'

export type GenerateTextNode = T.TypeOf<typeof GenerateTextNode>
export const GenerateTextNode = T.object({
	type: T.literal('generate_text'),
	lastResultText: T.string.nullable(),
})

const DEFAULT_PROMPT = 'Describe this image in detail.'

export class GenerateTextNodeDefinition extends NodeDefinition<GenerateTextNode> {
	static type = 'generate_text'
	static validator = GenerateTextNode
	title = 'Generate text'
	heading = 'Generate text'
	icon = GenerateTextIcon
	category = 'process'
	resultKeys = ['lastResultText'] as const
	getDefault(): GenerateTextNode {
		return {
			type: 'generate_text',
			lastResultText: null,
		}
	}
	getBodyHeightPx() {
		// input row (44) + prompt row (44) + result area (88 + 8 margin)
		return NODE_ROW_HEIGHT_PX * 2 + 96
	}
	getPorts(_shape: NodeShape, _node: GenerateTextNode): Record<string, ShapePort> {
		const baseY = NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX
		return {
			input: {
				id: 'input',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 0.5,
				terminal: 'end',
				dataType: 'any',
			},
			prompt: {
				id: 'prompt',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 1.5,
				terminal: 'end',
				dataType: 'text',
			},
			output: {
				id: 'output',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX / 2,
				terminal: 'start',
				dataType: 'text',
			},
		}
	}
	async execute(
		shape: NodeShape,
		_node: GenerateTextNode,
		inputs: InputValues
	): Promise<ExecutionResult> {
		const input = coerceToText(getInput(inputs, 'input')) || undefined
		const prompt = getInputText(inputs, 'prompt', DEFAULT_PROMPT)

		const result = await apiGenerateText({
			input,
			prompt,
		})

		updateNode<GenerateTextNode>(this.editor, shape, (n) => ({
			...n,
			lastResultText: result.text,
		}))

		return { output: result.text }
	}
	getOutputInfo(shape: NodeShape, node: GenerateTextNode, inputs: InfoValues): InfoValues {
		return {
			output: {
				value: node.lastResultText,
				isOutOfDate: areAnyInputsOutOfDate(inputs) || shape.props.isOutOfDate,
				dataType: 'text',
			},
		}
	}
	Component = GenerateTextNodeComponent
}
