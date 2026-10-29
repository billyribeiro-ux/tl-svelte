import { T } from 'svelte-draw'
import { PromptConcatIcon } from '../../components/icons/icons.svelte'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_ROW_HEADER_GAP_PX,
	NODE_ROW_HEIGHT_PX,
	NODE_WIDTH_PX,
} from '../../constants'
import type { ShapePort } from '../../ports/Port'
import { sleep } from '../../utils/sleep'
import type { NodeShape } from '../NodeShapeUtil'
import PromptConcatNodeComponent from './PromptConcatNodeComponent.svelte'
import {
	areAnyInputsOutOfDate,
	type ExecutionResult,
	type InfoValues,
	type InputValues,
	NodeDefinition,
} from './shared'

export const SEPARATORS = [
	{ id: 'space', label: 'Space', value: ' ' },
	{ id: 'newline', label: 'Newline', value: '\n' },
	{ id: 'comma', label: 'Comma', value: ', ' },
	{ id: 'none', label: 'None', value: '' },
] as const

export type PromptConcatNode = T.TypeOf<typeof PromptConcatNode>
export const PromptConcatNode = T.object({
	type: T.literal('prompt_concat'),
	separator: T.string,
})

export class PromptConcatNodeDefinition extends NodeDefinition<PromptConcatNode> {
	static type = 'prompt_concat'
	static validator = PromptConcatNode
	title = 'Concat'
	heading = 'Prompt concat'
	icon = PromptConcatIcon
	category = 'process'
	getDefault(): PromptConcatNode {
		return {
			type: 'prompt_concat',
			separator: 'space',
		}
	}
	getBodyHeightPx() {
		// 3 input rows + separator row + preview row
		return NODE_ROW_HEIGHT_PX * 5
	}
	getPorts(): Record<string, ShapePort> {
		const baseY = NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX
		return {
			prefix: {
				id: 'prefix',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 0.5,
				terminal: 'end',
				dataType: 'text',
			},
			main: {
				id: 'main',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 1.5,
				terminal: 'end',
				dataType: 'text',
			},
			suffix: {
				id: 'suffix',
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
				dataType: 'text',
			},
		}
	}
	async execute(
		_shape: NodeShape,
		node: PromptConcatNode,
		inputs: InputValues
	): Promise<ExecutionResult> {
		await sleep(100)
		const sep = SEPARATORS.find((s) => s.id === node.separator)?.value ?? ' '
		const parts = [inputs.prefix, inputs.main, inputs.suffix].filter(
			(v): v is string => typeof v === 'string' && v.length > 0
		)
		return { output: parts.join(sep) }
	}
	getOutputInfo(shape: NodeShape, node: PromptConcatNode, inputs: InfoValues): InfoValues {
		const sep = SEPARATORS.find((s) => s.id === node.separator)?.value ?? ' '
		const parts: string[] = []
		for (const key of ['prefix', 'main', 'suffix'] as const) {
			const info = inputs[key]
			if (info && typeof info.value === 'string' && info.value.length > 0) {
				parts.push(info.value)
			}
		}
		return {
			output: {
				value: parts.length > 0 ? parts.join(sep) : null,
				isOutOfDate: areAnyInputsOutOfDate(inputs) || shape.props.isOutOfDate,
				dataType: 'text',
			},
		}
	}
	Component = PromptConcatNodeComponent
}
