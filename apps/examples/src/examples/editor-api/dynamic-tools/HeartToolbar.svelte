<script lang="ts">
	import {
		createIsToolSelected,
		DefaultToolbar,
		DefaultToolbarContent,
		fromSignal,
		getTools,
		SvelteDrawUiMenuItem,
	} from 'svelte-draw'
	import { isHeartToolEnabled$ } from './HeartTool'

	const tools = getTools()
	const heartTool = $derived(tools.current['heart'])
	const isHeartSelected = createIsToolSelected(() => heartTool)
	const isHeartToolEnabled = fromSignal(isHeartToolEnabled$)
</script>

<DefaultToolbar>
	{#if isHeartToolEnabled.current}
		<SvelteDrawUiMenuItem {...heartTool} isSelected={isHeartSelected.current} />
	{/if}
	<DefaultToolbarContent />
</DefaultToolbar>
