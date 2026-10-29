import { T } from 'svelte-draw'
import { NumberIcon } from '../../components/icons/icons.svelte'
import { NODE_HEADER_HEIGHT_PX, NODE_ROW_HEIGHT_PX, NODE_WIDTH_PX } from '../../constants'
import type { ShapePort } from '../../ports/Port'
import { sleep } from '../../utils/sleep'
import type { NodeShape } from '../NodeShapeUtil'
import NumberNodeComponent from './NumberNodeComponent.svelte'
import { type ExecutionResult, type InfoValues, NodeDefinition } from './shared'

export type NumberNode = T.TypeOf<typeof NumberNode>
export const NumberNode = T.object({
	type: T.literal('number'),
	value: T.number,
})

export class NumberNodeDefinition extends NodeDefinition<NumberNode> {
	static type = 'number'
	static validator = NumberNode
	title = 'Number'
	heading = 'Number'
	hidden = true as const
	icon = NumberIcon
	category = 'input'
	getDefault(): NumberNode {
		return {
			type: 'number',
			value: 50,
		}
	}
	getBodyHeightPx() {
		return NODE_ROW_HEIGHT_PX
	}
	getPorts(): Record<string, ShapePort> {
		return {
			output: {
				id: 'output',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX / 2,
				terminal: 'start',
				dataType: 'number',
			},
		}
	}
	async execute(_shape: NodeShape, node: NumberNode): Promise<ExecutionResult> {
		await sleep(200)
		return { output: node.value }
	}
	getOutputInfo(shape: NodeShape, node: NumberNode): InfoValues {
		return {
			output: {
				value: node.value,
				isOutOfDate: shape.props.isOutOfDate,
				dataType: 'number',
			},
		}
	}
	Component = NumberNodeComponent
}
