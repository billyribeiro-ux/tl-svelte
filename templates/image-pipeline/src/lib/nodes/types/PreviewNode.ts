import { T } from 'svelte-draw'
import { PreviewIcon } from '../../components/icons/icons.svelte'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_IMAGE_PREVIEW_HEIGHT_PX,
	NODE_ROW_HEADER_GAP_PX,
	NODE_ROW_HEIGHT_PX,
} from '../../constants'
import type { ShapePort } from '../../ports/Port'
import { sleep } from '../../utils/sleep'
import type { NodeShape } from '../NodeShapeUtil'
import PreviewNodeComponent from './PreviewNodeComponent.svelte'
import {
	type ExecutionResult,
	type InfoValues,
	type InputValues,
	NodeDefinition,
	updateNode,
} from './shared'

export type PreviewNode = T.TypeOf<typeof PreviewNode>
export const PreviewNode = T.object({
	type: T.literal('preview'),
	lastImageUrl: T.string.nullable(),
})

export class PreviewNodeDefinition extends NodeDefinition<PreviewNode> {
	static type = 'preview'
	static validator = PreviewNode
	title = 'Preview'
	heading = 'Preview'
	icon = PreviewIcon
	category = 'output'
	resultKeys = ['lastImageUrl'] as const
	getDefault(): PreviewNode {
		return {
			type: 'preview',
			lastImageUrl: null,
		}
	}
	getBodyHeightPx() {
		return NODE_ROW_HEIGHT_PX + NODE_IMAGE_PREVIEW_HEIGHT_PX
	}
	getPorts(): Record<string, ShapePort> {
		const baseY = NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX
		return {
			image: {
				id: 'image',
				x: 0,
				y: baseY + NODE_ROW_HEIGHT_PX * 0.5,
				terminal: 'end',
				dataType: 'image',
			},
			// No output port — this is a terminal/sink node
		}
	}
	async execute(
		shape: NodeShape,
		_node: PreviewNode,
		inputs: InputValues
	): Promise<ExecutionResult> {
		await sleep(200)
		const imageUrl = inputs.image as string | null
		updateNode<PreviewNode>(this.editor, shape, (n) => ({
			...n,
			lastImageUrl: imageUrl ?? null,
		}))
		return {}
	}
	getOutputInfo(): InfoValues {
		return {}
	}
	Component = PreviewNodeComponent
}
