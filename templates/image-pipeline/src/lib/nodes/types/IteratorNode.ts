import { T } from 'svelte-draw'
import { apiGenerate } from '../../api/pipelineApi'
import { IteratorIcon } from '../../components/icons/icons.svelte'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_IMAGE_PREVIEW_HEIGHT_PX,
	NODE_ROW_HEADER_GAP_PX,
	NODE_ROW_HEIGHT_PX,
	NODE_WIDTH_PX,
} from '../../constants'
import type { ShapePort } from '../../ports/Port'
import type { NodeShape } from '../NodeShapeUtil'
import IteratorNodeComponent from './IteratorNodeComponent.svelte'
import type { ExecutionResult, InfoValues, InputValues } from './shared'
import { areAnyInputsOutOfDate, getInputText, NodeDefinition, updateNode } from './shared'

export type IteratorNode = T.TypeOf<typeof IteratorNode>
export const IteratorNode = T.object({
	type: T.literal('iterator'),
	items: T.string,
	completedCount: T.number,
	totalCount: T.number,
	lastResultUrl: T.string.nullable(),
})

export class IteratorNodeDefinition extends NodeDefinition<IteratorNode> {
	static type = 'iterator'
	static validator = IteratorNode
	title = 'Iterator'
	heading = 'Iterator'
	hidden = true as const
	icon = IteratorIcon
	category = 'utility'
	resultKeys = ['lastResultUrl', 'completedCount', 'totalCount'] as const
	getDefault(): IteratorNode {
		return {
			type: 'iterator',
			items: 'cat\ndog\nbird',
			completedCount: 0,
			totalCount: 0,
			lastResultUrl: null,
		}
	}
	getBodyHeightPx() {
		// template input row + items textarea (2 rows) + progress row + preview
		return NODE_ROW_HEIGHT_PX * 4 + NODE_IMAGE_PREVIEW_HEIGHT_PX
	}
	getPorts(): Record<string, ShapePort> {
		const baseY = NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX
		return {
			template: {
				id: 'template',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 0.5,
				terminal: 'end',
				dataType: 'any',
			},
			output: {
				id: 'output',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX / 2,
				terminal: 'start',
				dataType: 'image',
			},
			current_item: {
				id: 'current_item',
				x: NODE_WIDTH_PX,
				y: baseY + NODE_ROW_HEIGHT_PX * 0.5,
				terminal: 'start',
				dataType: 'text',
			},
		}
	}
	async execute(
		shape: NodeShape,
		node: IteratorNode,
		inputs: InputValues
	): Promise<ExecutionResult> {
		const items = node.items
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0)

		if (items.length === 0) {
			updateNode<IteratorNode>(this.editor, shape, (n) => ({
				...n,
				completedCount: 0,
				totalCount: 0,
				lastResultUrl: null,
			}))
			return { output: null, current_item: null }
		}

		updateNode<IteratorNode>(this.editor, shape, (n) => ({
			...n,
			completedCount: 0,
			totalCount: items.length,
		}))

		const template = getInputText(inputs, 'template')

		let lastResult: string | null = null
		for (let i = 0; i < items.length; i++) {
			const prompt = template ? `${template}, ${items[i]}` : items[i]
			const result = await apiGenerate({ model: 'stable-diffusion:sdxl', prompt })
			lastResult = result.imageUrl
			updateNode<IteratorNode>(this.editor, shape, (n) => ({
				...n,
				completedCount: i + 1,
				lastResultUrl: lastResult,
			}))
		}

		return { output: lastResult, current_item: items[items.length - 1] }
	}
	getOutputInfo(shape: NodeShape, node: IteratorNode, inputs: InfoValues): InfoValues {
		const items = node.items
			.split('\n')
			.map((s) => s.trim())
			.filter((s) => s.length > 0)
		const currentItem =
			node.completedCount > 0
				? (items[Math.min(node.completedCount - 1, items.length - 1)] ?? null)
				: null

		return {
			output: {
				value: node.lastResultUrl,
				isOutOfDate: areAnyInputsOutOfDate(inputs) || shape.props.isOutOfDate,
				dataType: 'image',
			},
			current_item: {
				value: currentItem,
				isOutOfDate: areAnyInputsOutOfDate(inputs) || shape.props.isOutOfDate,
				dataType: 'text',
			},
		}
	}
	Component = IteratorNodeComponent
}
