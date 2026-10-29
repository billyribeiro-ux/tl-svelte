import {
	Editor,
	createShapeId,
	createTLStore,
	defaultAddFontsFromNode,
	defaultBindingUtils,
	defaultShapeTools,
	defaultShapeUtils,
	defaultTools,
	tipTapDefaultExtensions,
	type TLShapeId,
} from 'svelte-draw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
	ConnectionBindingUtil,
	createOrUpdateConnectionBinding,
} from './connection/ConnectionBindingUtil'
import { ConnectionShapeUtil } from './connection/ConnectionShapeUtil'
import { keepConnectionsAtBottom } from './connection/keepConnectionsAtBottom'
import { disableTransparency } from './disableTransparency'
import { startExecution } from './execution/executionState'
import { getAllConnectedNodes, getNodeOutputPortInfo, getNodePorts } from './nodes/nodePorts'
import { NodeShapeUtil } from './nodes/NodeShapeUtil'
import { getNodeDefinition } from './nodes/nodeTypes'
import { STOP_EXECUTION } from './nodes/types/shared'

function createEditor() {
	const shapeUtils = [...defaultShapeUtils, NodeShapeUtil, ConnectionShapeUtil]
	const bindingUtils = [...defaultBindingUtils, ConnectionBindingUtil]
	const elm = document.createElement('div')
	elm.getBoundingClientRect = () =>
		({ x: 0, y: 0, top: 0, left: 0, width: 1080, height: 720, bottom: 720, right: 1080 }) as DOMRect
	return new Editor({
		shapeUtils,
		bindingUtils,
		tools: [...defaultTools, ...defaultShapeTools],
		store: createTLStore({ shapeUtils, bindingUtils }),
		getContainer: () => elm,
		initialState: 'select',
		options: {
			text: {
				addFontsFromNode: defaultAddFontsFromNode,
				tipTapConfig: { extensions: tipTapDefaultExtensions },
			},
		},
	})
}

function createNode(editor: Editor, type: Parameters<typeof getNodeDefinition>[1], x = 0, y = 0) {
	const id = createShapeId()
	editor.createShape({
		type: 'node',
		id,
		x,
		y,
		props: { node: getNodeDefinition(editor, type).getDefault() },
	})
	return id
}

function connect(
	editor: Editor,
	from: { id: TLShapeId; portId: string },
	to: { id: TLShapeId; portId: string }
) {
	const id = createShapeId()
	editor.createShape({ type: 'connection', id })
	createOrUpdateConnectionBinding(editor, id, from.id, { portId: from.portId, terminal: 'start' })
	createOrUpdateConnectionBinding(editor, id, to.id, { portId: to.portId, terminal: 'end' })
	return id
}

describe('workflow graph', () => {
	let editor: Editor

	beforeEach(() => {
		editor = createEditor()
	})

	afterEach(() => {
		editor.dispose()
		vi.useRealTimers()
	})

	it('derives ports from the node definition', () => {
		const add = createNode(editor, 'add')
		const ports = getNodePorts(editor, add)
		expect(ports.output).toMatchObject({ terminal: 'start' })
		// the default add node has two items, so two input ports
		expect(Object.values(ports).filter((p) => p.terminal === 'end')).toHaveLength(2)
	})

	it('flows a slider value into a downstream node before execution', () => {
		const slider = createNode(editor, 'slider')
		const multiply = createNode(editor, 'multiply')
		connect(editor, { id: slider, portId: 'output' }, { id: multiply, portId: 'multiplicand' })

		expect(getNodeOutputPortInfo(editor, slider).output).toEqual({ value: 50, isOutOfDate: false })
		// multiply has not executed: its last result is still null, so it reports 0
		expect(getNodeOutputPortInfo(editor, multiply).output.value).toBe(0)
	})

	it('finds connected nodes in a direction and avoids cycles through it', () => {
		const a = createNode(editor, 'slider')
		const b = createNode(editor, 'add')
		const c = createNode(editor, 'add')
		const [item] = Object.keys(getNodePorts(editor, b)).filter((k) => k.startsWith('item_'))
		const [item2] = Object.keys(getNodePorts(editor, c)).filter((k) => k.startsWith('item_'))
		connect(editor, { id: a, portId: 'output' }, { id: b, portId: item })
		connect(editor, { id: b, portId: 'output' }, { id: c, portId: item2 })

		expect(getAllConnectedNodes(editor, a)).toEqual(new Set([a, b, c]))
		expect(getAllConnectedNodes(editor, b, 'start')).toEqual(new Set([b, c]))
	})

	it('executes a graph in dependency order and stores results on the nodes', async () => {
		vi.useFakeTimers()
		const slider = createNode(editor, 'slider')
		const add = createNode(editor, 'add')
		const item = Object.keys(getNodePorts(editor, add)).find((k) => k.startsWith('item_'))!
		connect(editor, { id: slider, portId: 'output' }, { id: add, portId: item })

		const done = startExecution(editor, new Set([slider]))
		await vi.advanceTimersByTimeAsync(5000)
		await done

		const addShape = editor.getShape(add)!
		if (!editor.isShapeOfType(addShape, 'node') || addShape.props.node.type !== 'add') {
			throw new Error('expected an add node')
		}
		// slider default is 50, the other add item defaults to 0
		expect(addShape.props.node.lastResult).toBe(50)
		expect(addShape.props.isOutOfDate).toBe(false)
	})

	it('stops conditional branches with STOP_EXECUTION', async () => {
		vi.useFakeTimers()
		const slider = createNode(editor, 'slider')
		const conditional = createNode(editor, 'conditional')
		connect(editor, { id: slider, portId: 'output' }, { id: conditional, portId: 'lhs' })

		const done = startExecution(editor, new Set([slider]))
		await vi.advanceTimersByTimeAsync(5000)
		await done

		// 50 == 0 is false: the "true" branch stops and the node records which branch ran
		const outputs = getNodeOutputPortInfo(editor, conditional)
		expect(outputs.outputTrue.value).toBe(STOP_EXECUTION)
		const shape = editor.getShape(conditional)!
		if (!editor.isShapeOfType(shape, 'node') || shape.props.node.type !== 'conditional') {
			throw new Error('expected a conditional node')
		}
		expect(shape.props.node.previousResult).toBe('rhs')
	})
})

describe('shape side effects', () => {
	it('forces node and connection opacity to 1', () => {
		const editor = createEditor()
		disableTransparency(editor, ['node', 'connection'])
		const id = createShapeId()
		editor.createShape({ type: 'node', id, opacity: 0.5 })
		expect(editor.getShape(id)!.opacity).toBe(1)
		editor.updateShape({ id, type: 'node', opacity: 0.2 })
		expect(editor.getShape(id)!.opacity).toBe(1)
		editor.dispose()
	})

	it('keeps connections below every other shape', () => {
		const editor = createEditor()
		keepConnectionsAtBottom(editor)
		const connection = createShapeId()
		editor.createShape({ type: 'connection', id: connection })
		const node = createNode(editor, 'add')
		const sorted = editor.getSortedChildIdsForParent(editor.getCurrentPageId())
		expect(sorted.indexOf(connection)).toBeLessThan(sorted.indexOf(node))
		editor.dispose()
	})
})
