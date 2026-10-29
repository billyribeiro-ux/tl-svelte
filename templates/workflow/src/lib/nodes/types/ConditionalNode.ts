import { T } from 'svelte-draw'
import { conditionalIcon } from '../../components/icons/icons.svelte'
import {
	NODE_HEADER_HEIGHT_PX,
	NODE_ROW_BOTTOM_PADDING_PX,
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
	STOP_EXECUTION,
	updateNode,
} from './shared'

/**
 * The operators that can be used in the conditional node.
 */
export const operators = {
	'==': {
		title: 'is equal to',
		evaluate: (lhs, rhs) => lhs === rhs,
	},
	'!=': {
		title: 'is not equal to',
		evaluate: (lhs, rhs) => lhs !== rhs,
	},
	'>': {
		title: 'is greater than',
		evaluate: (lhs, rhs) => lhs > rhs,
	},
	'<': {
		title: 'is less than',
		evaluate: (lhs, rhs) => lhs < rhs,
	},
	'>=': {
		title: 'is greater than or equal to',
		evaluate: (lhs, rhs) => lhs >= rhs,
	},
	'<=': {
		title: 'is less than or equal to',
		evaluate: (lhs, rhs) => lhs <= rhs,
	},
} satisfies Record<
	string,
	{
		title: string
		evaluate: (lhs: number, rhs: number) => boolean
	}
>

export type Operator = keyof typeof operators
const Operator = T.literalEnum(...(Object.keys(operators) as Operator[]))

/**
 * The conditional node has a condition (two inputs and an operator), and two outputs. If the
 * condition evaluates to true, the first output port gets a value and the other stops execution. If
 * the condition evaluates to false, it's the other way around.
 */
export type ConditionalNode = T.TypeOf<typeof ConditionalNode>
export const ConditionalNode = T.object({
	type: T.literal('conditional'),
	lhs: T.number,
	rhs: T.number,
	operator: Operator,
	previousResult: T.literalEnum('lhs', 'rhs').nullable(),
})

export class ConditionalNodeDefinition extends NodeDefinition<ConditionalNode> {
	static type = 'conditional'
	static validator = ConditionalNode
	title = 'Conditional'
	heading = 'If'
	icon = conditionalIcon
	getDefault(): ConditionalNode {
		return {
			type: 'conditional',
			lhs: 0,
			rhs: 0,
			operator: '==',
			previousResult: null,
		}
	}
	// There are 5 rows in the conditional, but we have less padding at the bottom than usual.
	getBodyHeightPx() {
		return NODE_ROW_HEIGHT_PX * 5 - NODE_ROW_BOTTOM_PADDING_PX
	}
	// We need a port for each input and output.
	getPorts(): Record<string, ShapePort> {
		return {
			lhs: {
				id: 'lhs',
				x: 0,
				y: NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX + NODE_ROW_HEIGHT_PX * 0.5,
				terminal: 'end',
			},
			rhs: {
				id: 'rhs',
				x: 0,
				y: NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX + NODE_ROW_HEIGHT_PX * 2.5,
				terminal: 'end',
			},
			outputTrue: {
				id: 'outputTrue',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX + NODE_ROW_HEIGHT_PX * 3.5,
				terminal: 'start',
			},
			outputFalse: {
				id: 'outputFalse',
				x: NODE_WIDTH_PX,
				y: NODE_HEADER_HEIGHT_PX + NODE_ROW_HEADER_GAP_PX + NODE_ROW_HEIGHT_PX * 4.5,
				terminal: 'start',
			},
		}
	}
	// The output of the conditional node is the value of the first output port, or STOP_EXECUTION
	// if the condition is false.
	async execute(
		shape: NodeShape,
		node: ConditionalNode,
		inputs: InputValues
	): Promise<ExecutionResult> {
		await sleep(1000)

		const lhs = inputs.lhs ?? node.lhs
		const rhs = inputs.rhs ?? node.rhs

		if (operators[node.operator].evaluate(lhs, rhs)) {
			updateNode<ConditionalNode>(this.editor, shape, (node) => ({
				...node,
				previousResult: 'lhs',
			}))
			return { outputTrue: lhs, outputFalse: STOP_EXECUTION }
		} else {
			updateNode<ConditionalNode>(this.editor, shape, (node) => ({
				...node,
				previousResult: 'rhs',
			}))
			return { outputTrue: STOP_EXECUTION, outputFalse: lhs }
		}
	}
	getOutputInfo(shape: NodeShape, node: ConditionalNode, inputs: InfoValues): InfoValues {
		const isOutOfDate = areAnyInputsOutOfDate(inputs) || shape.props.isOutOfDate
		const lhs = inputs.lhs?.value ?? node.lhs
		const rhs = inputs.rhs?.value ?? node.rhs

		return {
			outputTrue:
				node.previousResult === 'rhs'
					? { value: STOP_EXECUTION, isOutOfDate }
					: { value: lhs, isOutOfDate },
			outputFalse:
				node.previousResult === 'rhs'
					? { value: rhs, isOutOfDate }
					: { value: STOP_EXECUTION, isOutOfDate },
		}
	}
}
