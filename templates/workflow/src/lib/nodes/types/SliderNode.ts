import { T } from 'svelte-draw'
import { sliderIcon } from '../../components/icons/icons.svelte'
import { NODE_HEADER_HEIGHT_PX, NODE_ROW_HEIGHT_PX, NODE_WIDTH_PX } from '../../constants'
import type { ShapePort } from '../../ports/Port'
import { sleep } from '../../utils/sleep'
import type { NodeShape } from '../NodeShapeUtil'
import { type ExecutionResult, type InfoValues, NodeDefinition } from './shared'

/**
 * The slider node has a single output port and no inputs.
 */
export type SliderNode = T.TypeOf<typeof SliderNode>
export const SliderNode = T.object({
	type: T.literal('slider'),
	value: T.number,
})

export class SliderNodeDefinition extends NodeDefinition<SliderNode> {
	static type = 'slider'
	static validator = SliderNode
	title = 'Slider'
	heading = 'Slider'
	icon = sliderIcon
	getDefault(): SliderNode {
		return {
			type: 'slider',
			value: 50,
		}
	}
	getBodyHeightPx(_shape: NodeShape, _node: SliderNode) {
		return NODE_ROW_HEIGHT_PX
	}
	getPorts(_shape: NodeShape, _node: SliderNode): Record<string, ShapePort> {
		return {
			output: {
				id: 'output',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX / 2,
				terminal: 'start',
			},
		}
	}
	async execute(_shape: NodeShape, node: SliderNode): Promise<ExecutionResult> {
		await sleep(1000)

		return {
			output: node.value,
		}
	}
	getOutputInfo(shape: NodeShape, node: SliderNode): InfoValues {
		return {
			output: {
				value: node.value,
				isOutOfDate: shape.props.isOutOfDate,
			},
		}
	}
}
