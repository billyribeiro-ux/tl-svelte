<script lang="ts">
	import classNames from 'classnames'
	import { HTMLContainer, fromComputed, getEditor } from 'svelte-draw'
	import { executionState } from '../execution/executionState'
	import Port from '../ports/Port.svelte'
	import { getNodeOutputPortInfo } from './nodePorts'
	import type { NodeShape } from './NodeShapeUtil'
	import { getNodeDefinition } from './nodeTypes'
	import NodeBody from './NodeBody.svelte'
	import NodeValue from './types/NodeValue.svelte'
	import { STOP_EXECUTION } from './types/shared'

	// Main node component that renders the HTML content
	let { shape }: { shape: NodeShape } = $props()

	const editor = getEditor()

	// Get the node's output value
	const output = fromComputed(
		'output',
		() => getNodeOutputPortInfo(editor, shape.id)?.output ?? undefined
	)

	// Check if this node is currently executing using our execution state
	const isExecuting = fromComputed(
		'is executing',
		() => executionState.get(editor).runningGraph?.getNodeStatus(shape.id) === 'executing'
	)

	const nodeDefinition = $derived(getNodeDefinition(editor, shape.props.node))
</script>

<HTMLContainer
	class={classNames('NodeShape', {
		NodeShape_executing: isExecuting.current,
	})}
>
	<div class="NodeShape-heading">
		<div class="NodeShape-label">{nodeDefinition.heading ?? nodeDefinition.title}</div>
		{#if output.current !== undefined}
			<div class="NodeShape-output">
				<NodeValue
					value={output.current.isOutOfDate ? STOP_EXECUTION : output.current.value}
				/>
			</div>
			<Port shapeId={shape.id} portId="output" />
		{/if}
	</div>
	<NodeBody {shape} />
</HTMLContainer>
