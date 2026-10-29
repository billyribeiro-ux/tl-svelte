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
	const tool = $derived(tools.current['card'])
	const isSelected = createIsToolSelected(() => tool)
</script>

<DefaultToolbar {...props}>
	{#if tool}
		<SvelteDrawUiMenuItem {...tool} isSelected={isSelected.current} />
	{/if}
	<DefaultToolbarContent />
</DefaultToolbar>
