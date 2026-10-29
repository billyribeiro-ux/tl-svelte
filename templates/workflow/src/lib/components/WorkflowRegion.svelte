<script lang="ts">
	import classNames from 'classnames'
	import {
		fromComputed,
		getEditor,
		nativeEvents,
		quickReactor,
		usePassThroughWheelEvents,
	} from 'svelte-draw'
	import { executionState, startExecution, stopExecution } from '../execution/executionState'
	import type { WorkflowRegion } from './findWorkflowRegions'
	import PlayIcon from './icons/PlayIcon.svelte'
	import StopIcon from './icons/StopIcon.svelte'

	// Individual workflow region component with execution controls
	let { workflow }: { workflow: WorkflowRegion } = $props()

	const editor = getEditor()
	let ref = $state<HTMLDivElement | null>(null)

	// Check if this workflow is currently executing. `workflow` is a prop, so it is tracked by
	// Svelte rather than by the signal: the computed is rebuilt whenever it changes.
	const isExecutingSignal = $derived(
		fromComputed('isExecuting', () => {
			const execution = executionState.get(editor).runningGraph
			if (!execution) return false

			// Check if any node in this workflow is executing
			for (const nodeId of workflow.nodes) {
				if (execution.getNodeStatus(nodeId) === 'executing') {
					return true
				}
			}

			return false
		})
	)
	const isExecuting = $derived(isExecutingSignal.current)

	// Reactively position the workflow region based on camera and workflow bounds
	$effect(() => {
		const element = ref
		const bounds = workflow.bounds
		if (!element) return
		return quickReactor('WorkflowRegion positioning', () => {
			const camera = editor.getCamera()

			// Hide regions when zoomed out too far
			if (camera.z < 0.25) {
				element.style.display = 'none'
				return
			} else {
				element.style.display = 'block'
			}

			// Transform workflow bounds from page space to viewport space
			const position = editor.pageToViewport(bounds)
			element.style.transform = `translate(${position.x}px, ${position.y}px)`
			// Scale the region based on camera zoom
			element.style.width = `${bounds.w * camera.z}px`
			element.style.height = `${bounds.h * camera.z}px`
		})
	})

	const passThroughWheelEvents = usePassThroughWheelEvents()

	// Marked as handled on the native event, before the editor's own listeners run.
	const events = nativeEvents({
		pointerdown: (e) => editor.markEventAsHandled(e),
	})
</script>

<div
	class={classNames('WorkflowRegion', { WorkflowRegion_executing: isExecuting })}
	bind:this={ref}
	{@attach passThroughWheelEvents}
>
	<button
		class="WorkflowRegion-button"
		{@attach events}
		onclick={() => {
			if (isExecuting) {
				// Stop execution if currently running
				stopExecution(editor)
			} else {
				// Start execution from the workflow's starting nodes
				startExecution(editor, workflow.startingNodes)
			}
		}}
	>
		{#if isExecuting}
			<StopIcon />
		{:else}
			<PlayIcon />
		{/if}
	</button>
</div>
