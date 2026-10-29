import type { Editor, T, TLUiIconJsx } from 'svelte-draw'
import { NODE_HEADER_HEIGHT_PX, NODE_WIDTH_PX } from '../../constants'
import type { PortId, ShapePort } from '../../ports/Port'
import type { NodeShape } from '../NodeShapeUtil'
import type { NodeType } from '../nodeTypes'

export type WorkflowValue = number

/**
 * A special value that can be returned from a node to indicate that execution should stop.
 */
export type STOP_EXECUTION = typeof STOP_EXECUTION
export const STOP_EXECUTION = Symbol('STOP_EXECUTION')

export interface InfoValues {
	[key: string]: { value: WorkflowValue | STOP_EXECUTION; isOutOfDate: boolean }
}

export interface ExecutionResult {
	[key: string]: WorkflowValue | STOP_EXECUTION
}

export interface InputValues {
	[key: string]: WorkflowValue
}

export interface NodeComponentProps<Node extends { type: string }> {
	shape: NodeShape
	node: Node
}

export abstract class NodeDefinition<Node extends { type: string }> {
	constructor(public readonly editor: Editor) {
		const ctor = this.constructor as NodeDefinitionConstructor<Node>
		this.type = ctor.type
		this.validator = ctor.validator
	}

	readonly type: Node['type']
	readonly validator: T.Validator<Node>
	abstract readonly title: string
	abstract readonly heading?: string
	abstract readonly icon: TLUiIconJsx

	abstract getDefault(): Node
	abstract getBodyHeightPx(shape: NodeShape, node: Node): number
	abstract getPorts(shape: NodeShape, node: Node): Record<string, ShapePort>
	onPortConnect(_shape: NodeShape, _node: Node, _port: PortId): void {}
	onPortDisconnect(_shape: NodeShape, _node: Node, _port: PortId): void {}
	abstract getOutputInfo(shape: NodeShape, node: Node, inputs: InfoValues): InfoValues
	abstract execute(shape: NodeShape, node: Node, inputs: InputValues): Promise<ExecutionResult>
}

export interface NodeDefinitionConstructor<Node extends { type: string }> {
	new (editor: Editor): NodeDefinition<Node>
	readonly type: Node['type']
	readonly validator: T.Validator<Node>
}

/**
 * The standard output port for a node, appearing in the node header.
 */
export const outputPort: ShapePort = {
	id: 'output',
	x: NODE_WIDTH_PX,
	y: NODE_HEADER_HEIGHT_PX / 2,
	terminal: 'start',
}

/**
 * Update the `node` prop within a node shape.
 */
export function updateNode<T extends NodeType>(
	editor: Editor,
	shape: NodeShape,
	update: (node: T) => T,
	isOutOfDate: boolean = true
) {
	editor.updateShape({
		id: shape.id,
		type: shape.type,
		props: { node: update(shape.props.node as T), isOutOfDate },
	})
}

export function areAnyInputsOutOfDate(inputs: InfoValues): boolean {
	return Object.values(inputs).some((input) => input.isOutOfDate)
}
