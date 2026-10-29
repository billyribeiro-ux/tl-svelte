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
	const pin = $derived(tools.current.pin)
	const isPinSelected = createIsToolSelected(() => pin)
</script>

<DefaultToolbar {...props}>
	{#if pin}
		<SvelteDrawUiMenuItem {...pin} isSelected={isPinSelected.current} />
	{/if}
	<DefaultToolbarContent />
</DefaultToolbar>
