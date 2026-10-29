import { T } from 'svelte-draw'
import { sendIcon } from '../../components/icons.svelte'
import { NODE_HEIGHT_PX, NODE_WIDTH_PX } from '../../constants'
import type { NodeShape } from '../NodeShapeUtil'
import MessageNodeComponent from './MessageNodeComponent.svelte'
import { NodeDefinition, shapeInputPort, shapeOutputPort } from './shared'

/**
 * This node is a message from the user.
 */
export type MessageNode = T.TypeOf<typeof MessageNode>
export const MessageNode = T.object({
	type: T.literal('message'),
	userMessage: T.string,
	assistantMessage: T.string,
})

export class MessageNodeDefinition extends NodeDefinition<MessageNode> {
	static type = 'message'
	static validator = MessageNode
	title = 'Message'
	heading = 'Message'
	icon = sendIcon
	getDefault(): MessageNode {
		return {
			type: 'message',
			userMessage: 'hello',
			assistantMessage: '',
		}
	}
	getBodyWidthPx(_shape: NodeShape, _node: MessageNode): number {
		return NODE_WIDTH_PX
	}
	getBodyHeightPx(_shape: NodeShape, node: MessageNode): number {
		const assistantMessage = node.assistantMessage.trim()
		if (assistantMessage === '') return NODE_HEIGHT_PX
		const size = this.editor.textMeasure.measureText(assistantMessage, {
			fontFamily: 'Inter',
			fontSize: 12,
			fontWeight: '500',
			fontStyle: 'normal',
			maxWidth: NODE_WIDTH_PX,
			lineHeight: 1.3,
			padding: '12px',
		})
		return NODE_HEIGHT_PX + size.h
	}
	getPorts(shape: NodeShape, node: MessageNode) {
		return {
			input: shapeInputPort,
			output: {
				...shapeOutputPort,
				y: this.getBodyHeightPx(shape, node),
			},
		}
	}

	Component = MessageNodeComponent
}
