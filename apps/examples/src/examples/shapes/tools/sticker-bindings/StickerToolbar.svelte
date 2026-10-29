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
	const sticker = $derived(tools.current.sticker)
	const isStickerSelected = createIsToolSelected(() => sticker)
</script>

<DefaultToolbar {...props}>
	{#if sticker}
		<SvelteDrawUiMenuItem {...sticker} isSelected={isStickerSelected.current} />
	{/if}
	<DefaultToolbarContent />
</DefaultToolbar>
