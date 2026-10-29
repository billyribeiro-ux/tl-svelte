<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import { findWorkflowRegions } from './findWorkflowRegions'
	import WorkflowRegion from './WorkflowRegion.svelte'

	// Component that renders workflow regions as overlays on the canvas
	const editor = getEditor()
	// Reactively compute workflows when the canvas changes
	const workflows = fromComputed('workflows', () => findWorkflowRegions(editor))
</script>

{#each workflows.current as workflow, i (i)}
	<WorkflowRegion {workflow} />
{/each}
