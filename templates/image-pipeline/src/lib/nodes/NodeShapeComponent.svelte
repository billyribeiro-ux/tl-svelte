<script lang="ts">
	import { fromComputed, getEditor, HTMLContainer, nativeEvents } from 'svelte-draw'
	import { PlayIcon, StopIcon } from '../components/icons/icons.svelte'
	import { executionState, startExecution, stopExecution } from '../execution/executionState'
	import Port from '../ports/Port.svelte'
	import { getNodeOutputPortInfo } from './nodePorts'
	import type { NodeShape } from './NodeShapeUtil'
	import NodeBody from './NodeBody.svelte'
	import NodeFooterMenu from './NodeFooterMenu.svelte'
	import { getNodeDefinition } from './nodeTypes'
	import NodeValue from './types/NodeValue.svelte'
	import { STOP_EXECUTION } from './types/shared'

	let { shape }: { shape: NodeShape } = $props()

	const editor = getEditor()

	// Each bridge is re-created when the shape changes so it follows the new shape id.
	const outputValue = $derived(
		fromComputed('output', () => getNodeOutputPortInfo(editor, shape.id)?.output ?? undefined)
	)
	const output = $derived(outputValue.current)

	const isExecutingValue = $derived(
		fromComputed(
			'is executing',
			() => executionState.get(editor).runningGraph?.getNodeStatus(shape.id) === 'executing'
		)
	)
	const isExecuting = $derived(isExecutingValue.current)

	const isGraphRunningValue = fromComputed(
		'is graph running',
		() => executionState.get(editor).runningGraph !== null
	)
	const isGraphRunning = $derived(isGraphRunningValue.current)

	const nodeDefinition = $derived(getNodeDefinition(editor, shape.props.node))

	// Native listeners: Svelte's delegated handlers run after the editor's own listeners, too late
	// to stop the event.
	const stopContextMenuOnFields = nativeEvents({
		contextmenu: (e) => {
			const target = e.target as HTMLElement
			const tag = target.tagName
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
				e.stopPropagation()
			}
		},
	})
	const stopPointerDown = nativeEvents({ pointerdown: (e) => e.stopPropagation() })
</script>

<HTMLContainer
	class={[
		'NodeShape',
		isExecuting && 'NodeShape_executing',
		shape.props.node.type === 'capture' && 'NodeShape_capture',
	]}
	{@attach stopContextMenuOnFields}
>
	<div class="NodeShape-heading">
		<div class="NodeShape-icon">{@render nodeDefinition.icon({ props: {} })}</div>
		<div class="NodeShape-label">{nodeDefinition.heading ?? nodeDefinition.title}</div>
		{#if output !== undefined}
			<div class="NodeShape-output">
				<NodeValue
					value={output.isOutOfDate
						? STOP_EXECUTION
						: output.multi
							? output.value[0]
							: output.value}
				/>
			</div>
			<Port shapeId={shape.id} portId="output" />
		{/if}
	</div>
	<NodeBody {shape} />
	<div class="NodeShape-footer">
		<button
			class={['NodeShape-footer-action', isExecuting && 'NodeShape-footer-action_executing']}
			{@attach stopPointerDown}
			onclick={() => {
				if (isGraphRunning) {
					stopExecution(editor)
				} else {
					startExecution(editor, new Set([shape.id]))
				}
			}}
		>
			{#if isExecuting}
				{@render StopIcon({ props: {} })}
			{:else}
				{@render PlayIcon({ props: {} })}
			{/if}
			<span>{isExecuting ? 'Stop' : 'Play from here'}</span>
		</button>
		<NodeFooterMenu {shape} />
	</div>
</HTMLContainer>
