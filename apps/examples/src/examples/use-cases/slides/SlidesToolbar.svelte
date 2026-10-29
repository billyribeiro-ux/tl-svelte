<script lang="ts">
	import {
		DefaultToolbar,
		DefaultToolbarContent,
		SvelteDrawUiMenuItem,
		createIsToolSelected,
		getTools,
	} from 'svelte-draw'

	let props: Record<string, unknown> = $props()

	const tools = getTools()
	const isSlideSelected = createIsToolSelected(() => tools.current['slide'])
</script>

<DefaultToolbar {...props}>
	<SvelteDrawUiMenuItem {...tools.current['slide']} isSelected={isSlideSelected.current} />
	<DefaultToolbarContent />
</DefaultToolbar>
