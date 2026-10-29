<script lang="ts">
	import {
		DefaultToolbar,
		DefaultToolbarContent,
		type DefaultToolbarProps,
		SvelteDrawUiMenuItem,
		createIsToolSelected,
		getTools,
	} from 'svelte-draw'

	let props: Omit<DefaultToolbarProps, 'children'> = $props()

	const tools = getTools()
	const speechTool = $derived(tools.current['speech'])
	const isSpeechBubbleSelected = createIsToolSelected(() => speechTool)
</script>

<DefaultToolbar {...props}>
	{#if speechTool}
		<SvelteDrawUiMenuItem {...speechTool} isSelected={isSpeechBubbleSelected.current} />
	{/if}
	<DefaultToolbarContent />
</DefaultToolbar>
