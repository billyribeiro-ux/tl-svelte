<script lang="ts">
	import {
		createIsToolSelected,
		DefaultToolbar,
		DefaultToolbarContent,
		getTools,
		SvelteDrawUiMenuItem,
		type DefaultToolbarProps,
	} from 'svelte-draw'

	let { children: _children, ...props }: DefaultToolbarProps = $props()

	const tools = getTools()
	const isCounterSelected = createIsToolSelected(() => tools.current['counter'])
</script>

<DefaultToolbar {...props}>
	<SvelteDrawUiMenuItem {...tools.current['counter']} isSelected={isCounterSelected.current} />
	<DefaultToolbarContent />
</DefaultToolbar>
