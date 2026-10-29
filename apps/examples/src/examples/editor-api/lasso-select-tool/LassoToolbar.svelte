<script lang="ts">
	import {
		createIsToolSelected,
		DefaultToolbar,
		DefaultToolbarContent,
		getTools,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'

	const tools = getTools()
	const lassoTool = $derived(tools.current['lasso-select'])
	const isLassoSelected = createIsToolSelected(() => lassoTool)
</script>

<DefaultToolbar>
	<SvelteDrawUiMenuItem {...lassoTool} isSelected={isLassoSelected.current} />
	<DefaultToolbarContent />
</DefaultToolbar>
