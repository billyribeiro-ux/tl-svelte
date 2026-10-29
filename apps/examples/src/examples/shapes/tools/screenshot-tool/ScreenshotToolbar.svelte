<script lang="ts">
	import {
		DefaultToolbar,
		DefaultToolbarContent,
		SvelteDrawUiMenuItem,
		createIsToolSelected,
		getTools,
	} from 'svelte-draw'

	const tools = getTools()
	const screenshotTool = $derived(tools.current['screenshot'])
	const isScreenshotSelected = createIsToolSelected(() => screenshotTool)
</script>

<DefaultToolbar>
	{#if screenshotTool}
		<SvelteDrawUiMenuItem {...screenshotTool} isSelected={isScreenshotSelected.current} />
	{/if}
	<DefaultToolbarContent />
</DefaultToolbar>
