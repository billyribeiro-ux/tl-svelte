<script lang="ts">
	import {
		DefaultToolbar,
		DefaultToolbarContent,
		SvelteDrawUiMenuItem,
		createIsToolSelected,
		getTools,
	} from 'svelte-draw'

	const tools = getTools()
	const math = $derived(tools.current.math)
	const isMathSelected = createIsToolSelected(() => math)
</script>

<DefaultToolbar>
	{#if math}
		<SvelteDrawUiMenuItem {...math} isSelected={isMathSelected.current} />
	{/if}
	<DefaultToolbarContent />
</DefaultToolbar>
