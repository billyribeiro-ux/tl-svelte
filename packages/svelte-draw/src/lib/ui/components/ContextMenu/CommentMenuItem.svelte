<script lang="ts">
	import { getTools } from '../../hooks/useTools.svelte'
	import SvelteDrawUiMenuItem from '../primitives/menus/SvelteDrawUiMenuItem.svelte'

	const tools = getTools()
	const commentTool = $derived(tools.current.comment)
</script>

{#if commentTool}
	<!-- `c` enters the tool rather than opening a composer at the menu's point, so don't advertise it. -->
	<SvelteDrawUiMenuItem {...commentTool} kbd={undefined} />
{/if}
