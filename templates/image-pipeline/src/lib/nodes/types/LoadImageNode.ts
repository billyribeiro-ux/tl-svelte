import { T } from 'svelte-draw'
import { LoadImageIcon } from '../../components/icons/icons.svelte'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_IMAGE_PREVIEW_HEIGHT_PX,
	NODE_ROW_HEIGHT_PX,
	NODE_WIDTH_PX,
} from '../../constants'
import type { ShapePort } from '../../ports/Port'
import { sleep } from '../../utils/sleep'
import type { NodeShape } from '../NodeShapeUtil'
import LoadImageNodeComponent from './LoadImageNodeComponent.svelte'
import { type ExecutionResult, type InfoValues, NodeDefinition } from './shared'

export type LoadImageNode = T.TypeOf<typeof LoadImageNode>
export const LoadImageNode = T.object({
	type: T.literal('load_image'),
	imageUrl: T.string.nullable(),
})

export class LoadImageNodeDefinition extends NodeDefinition<LoadImageNode> {
	static type = 'load_image'
	static validator = LoadImageNode
	title = 'Load image'
	heading = 'Image'
	icon = LoadImageIcon
	category = 'input'
	getDefault(): LoadImageNode {
		return {
			type: 'load_image',
			imageUrl: null,
		}
	}
	getBodyHeightPx() {
		return NODE_ROW_HEIGHT_PX + NODE_IMAGE_PREVIEW_HEIGHT_PX
	}
	getPorts(): Record<string, ShapePort> {
		return {
			output: {
				id: 'output',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX / 2,
				terminal: 'start',
				dataType: 'image',
			},
		}
	}
	async execute(_shape: NodeShape, node: LoadImageNode): Promise<ExecutionResult> {
		await sleep(300)
		return { output: node.imageUrl }
	}
	getOutputInfo(shape: NodeShape, node: LoadImageNode): InfoValues {
		return {
			output: {
				value: node.imageUrl,
				isOutOfDate: shape.props.isOutOfDate,
				dataType: 'image',
			},
		}
	}
	Component = LoadImageNodeComponent
}
