import { T } from 'svelte-draw'
import { multiplyIcon } from '../../components/icons/icons.svelte'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_ROW_HEADER_GAP_PX,
	NODE_ROW_HEIGHT_PX,
	NODE_WIDTH_PX,
} from '../../constants'
import type { ShapePort } from '../../ports/Port'
import { sleep } from '../../utils/sleep'
import type { NodeShape } from '../NodeShapeUtil'
import {
	areAnyInputsOutOfDate,
	type ExecutionResult,
	type InfoValues,
	type InputValues,
	NodeDefinition,
	updateNode,
} from './shared'

/**
 * The multiply node multiplies its two inputs.
 */
export type MultiplyNode = T.TypeOf<typeof MultiplyNode>
export const MultiplyNode = T.object({
	type: T.literal('multiply'),
	a: T.number,
	b: T.number,
	lastResult: T.number.nullable(),
})

export class MultiplyNodeDefinition extends NodeDefinition<MultiplyNode> {
	static type = 'multiply'
	static validator = MultiplyNode
	title = 'Multiply'
	heading = 'Multiply'
	icon = multiplyIcon
	getDefault(): MultiplyNode {
		return {
			type: 'multiply',
			a: 0,
			b: 0,
			lastResult: null,
		}
	}
	getBodyHeightPx(_shape: NodeShape, _node: MultiplyNode) {
		return NODE_ROW_HEIGHT_PX * 2
	}
	getPorts(_shape: NodeShape, _node: MultiplyNode): Record<string, ShapePort> {
		return {
			output: {
				id: 'output',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX / 2,
				terminal: 'start',
			},
			multiplicand: {
				id: 'multiplicand',
				x: 0,
				y: NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX + NODE_ROW_HEIGHT_PX / 2,
				terminal: 'end',
			},
			multiplier: {
				id: 'multiplier',
				x: 0,
				y:
					NODE_HEADER_HEIGHT_PX +
					NODE_ROW_HEADER_GAP_PX +
					NODE_ROW_HEIGHT_PX +
					NODE_ROW_HEIGHT_PX / 2,
				terminal: 'end',
			},
		}
	}
	async execute(
		shape: NodeShape,
		node: MultiplyNode,
		inputs: InputValues
	): Promise<ExecutionResult> {
		await sleep(1000)

		const result = (inputs.multiplicand ?? node.a) * (inputs.multiplier ?? node.b)
		updateNode<MultiplyNode>(this.editor, shape, (node) => ({
			...node,
			lastResult: result,
		}))
		return {
			output: result,
		}
	}
	getOutputInfo(shape: NodeShape, node: MultiplyNode, inputs: InfoValues): InfoValues {
		return {
			output: {
				value: node.lastResult ?? 0,
				isOutOfDate: areAnyInputsOutOfDate(inputs) || shape.props.isOutOfDate,
			},
		}
	}
}
