<script lang="ts">
	import FrameSelectionMenuItem from '../../../lib/ui/components/menu-items/FrameSelectionMenuItem.svelte'
	import SvelteDrawUiMenuContextProvider from '../../../lib/ui/components/primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
</script>

<SvelteDrawUiMenuContextProvider type="keyboard-shortcuts" sourceId="kbd">
	<FrameSelectionMenuItem />
</SvelteDrawUiMenuContextProvider>
