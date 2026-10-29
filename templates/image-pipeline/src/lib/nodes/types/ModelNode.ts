import { T } from 'svelte-draw'
import { ModelIcon } from '../../components/icons/icons.svelte'
import { NODE_HEADER_HEIGHT_PX, NODE_ROW_HEIGHT_PX, NODE_WIDTH_PX } from '../../constants'
import type { ShapePort } from '../../ports/Port'
import { sleep } from '../../utils/sleep'
import type { NodeShape } from '../NodeShapeUtil'
import ModelNodeComponent from './ModelNodeComponent.svelte'
import { type ExecutionResult, type InfoValues, NodeDefinition } from './shared'

interface ModelInfo {
	id: string
	label: string
}

export const PROVIDERS: Record<string, { label: string; models: ModelInfo[] }> = {
	flux: {
		label: 'Flux',
		models: [
			{ id: 'flux-dev', label: 'Flux Dev' },
			{ id: 'flux-schnell', label: 'Flux Schnell' },
			{ id: 'flux-pro', label: 'Flux Pro' },
		],
	},
	google: {
		label: 'Google',
		models: [
			{ id: 'nano-banana-pro', label: 'Nano Banana Pro' },
			{ id: 'nano-banana', label: 'Nano Banana' },
			{ id: 'imagen-4-fast', label: 'Imagen 4 Fast' },
		],
	},
}

export type ModelNode = T.TypeOf<typeof ModelNode>
export const ModelNode = T.object({
	type: T.literal('model'),
	provider: T.string,
	modelId: T.string,
})

export class ModelNodeDefinition extends NodeDefinition<ModelNode> {
	static type = 'model'
	static validator = ModelNode
	title = 'Load model'
	heading = 'Model'
	icon = ModelIcon
	category = 'input'
	getDefault(): ModelNode {
		return {
			type: 'model',
			provider: 'flux',
			modelId: 'flux-dev',
		}
	}
	getBodyHeightPx() {
		return NODE_ROW_HEIGHT_PX * 2
	}
	getPorts(): Record<string, ShapePort> {
		return {
			output: {
				id: 'output',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX / 2,
				terminal: 'start',
				dataType: 'model',
			},
		}
	}
	async execute(_shape: NodeShape, node: ModelNode): Promise<ExecutionResult> {
		await sleep(500)
		return { output: `${node.provider}:${node.modelId}` }
	}
	getOutputInfo(shape: NodeShape, node: ModelNode): InfoValues {
		return {
			output: {
				value: `${node.provider}:${node.modelId}`,
				isOutOfDate: shape.props.isOutOfDate,
				dataType: 'model',
			},
		}
	}
	Component = ModelNodeComponent
}
