<script lang="ts">
	import {
		fromComputed,
		getEditor,
		nativeEvents,
		quickReactor,
		usePassThroughWheelEvents,
	} from 'svelte-draw'
	import { executionState, startExecution, stopExecution } from '../execution/executionState'
	import type { PipelineRegion } from './findPipelineRegions'
	import { PlayIcon, StopIcon } from './icons/icons.svelte'

	let { region }: { region: PipelineRegion } = $props()

	const editor = getEditor()
	let ref = $state<HTMLDivElement | null>(null)

	const isExecutingValue = $derived(
		fromComputed('isExecuting', () => {
			const execution = executionState.get(editor).runningGraph
			if (!execution) return false

			for (const nodeId of region.nodes) {
				if (execution.getNodeStatus(nodeId) === 'executing') {
					return true
				}
			}

			return false
		})
	)
	const isExecuting = $derived(isExecutingValue.current)

	$effect(() => {
		const element = ref
		const bounds = region.bounds
		return quickReactor('PipelineRegion positioning', () => {
			if (!element) return
			const camera = editor.getCamera()

			if (camera.z < 0.25) {
				element.style.display = 'none'
				return
			} else {
				element.style.display = 'block'
			}

			const position = editor.pageToViewport(bounds)
			element.style.transform = `translate(${position.x}px, ${position.y}px)`
			element.style.width = `${bounds.w * camera.z}px`
			element.style.height = `${bounds.h * camera.z}px`
		})
	})

	const passThroughWheelEvents = usePassThroughWheelEvents()

	// Native listener: a delegated `onpointerdown` would run after the editor's own listeners.
	const markPointerDownAsHandled = nativeEvents({
		pointerdown: (e) => editor.markEventAsHandled(e),
	})
</script>

<div
	class={['PipelineRegion', isExecuting && 'PipelineRegion_executing']}
	bind:this={ref}
	{@attach passThroughWheelEvents}
>
	<button
		class="PipelineRegion-button"
		{@attach markPointerDownAsHandled}
		onclick={() => {
			if (isExecuting) {
				stopExecution(editor)
			} else {
				startExecution(editor, region.startingNodes)
			}
		}}
	>
		{#if isExecuting}
			{@render StopIcon({ props: {} })}
		{:else}
			{@render PlayIcon({ props: {} })}
		{/if}
	</button>
</div>
