<script lang="ts">
	import {
		createIsToolSelected,
		DefaultToolbar,
		DefaultToolbarContent,
		getTools,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'

	const tools = getTools()
	const circleClipTool = $derived(tools.current['circle-clip'])
	const isCircleClipSelected = createIsToolSelected(() => circleClipTool)
</script>

<DefaultToolbar>
	<SvelteDrawUiMenuItem {...circleClipTool} isSelected={isCircleClipSelected.current} />
	<DefaultToolbarContent />
</DefaultToolbar>
