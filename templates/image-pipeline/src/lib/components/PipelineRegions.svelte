<script lang="ts">
	import { fromComputed, getEditor } from 'svelte-draw'
	import { findPipelineRegions } from './findPipelineRegions'
	import PipelineRegion from './PipelineRegion.svelte'

	const editor = getEditor()
	const regions = fromComputed('regions', () => findPipelineRegions(editor))
</script>

{#each regions.current as region, i (i)}
	<PipelineRegion {region} />
{/each}
