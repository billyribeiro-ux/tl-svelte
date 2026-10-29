<script lang="ts">
	import {
		createIsToolSelected,
		DefaultToolbar,
		DefaultToolbarContent,
		getTools,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'

	// [2]
	const tools = getTools()
	const sticker = $derived(tools.current['sticker'])
	const isStickerSelected = createIsToolSelected(() => sticker)
</script>

<DefaultToolbar>
	<SvelteDrawUiMenuItem {...sticker} isSelected={isStickerSelected.current} />
	<DefaultToolbarContent />
</DefaultToolbar>
