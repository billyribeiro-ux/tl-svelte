<script lang="ts">
	import { getUiComponents, SvelteDrawUiToolbar } from 'svelte-draw'

	const components = getUiComponents()
	// `getUiComponents()` exposes live getters, so read the slot inside `$derived`.
	const ZoomMenu = $derived(components.ZoomMenu)
</script>

<div style="background-color: thistle; padding: 14px;">
	here you are
	<SvelteDrawUiToolbar orientation="horizontal" label="Navigation">
		{#if ZoomMenu}
			<ZoomMenu />
		{/if}
	</SvelteDrawUiToolbar>
</div>
