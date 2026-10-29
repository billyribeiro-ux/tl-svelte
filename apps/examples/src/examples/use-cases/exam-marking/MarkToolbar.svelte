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
	const isMarkingToolSelected = createIsToolSelected(() => tools.current['mark'])
</script>

<DefaultToolbar {...props}>
	<SvelteDrawUiMenuItem {...tools.current['mark']} isSelected={isMarkingToolSelected.current} />
	<DefaultToolbarContent />
</DefaultToolbar>
