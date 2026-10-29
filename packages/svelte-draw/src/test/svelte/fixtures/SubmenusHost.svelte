<script lang="ts">
	import ArrangeMenuSubmenu from '../../../lib/ui/components/menu-items/ArrangeMenuSubmenu.svelte'
	import EditMenuSubmenu from '../../../lib/ui/components/menu-items/EditMenuSubmenu.svelte'
	import ReorderMenuSubmenu from '../../../lib/ui/components/menu-items/ReorderMenuSubmenu.svelte'
	import SvelteDrawUiMenuContextProvider from '../../../lib/ui/components/primitives/menus/SvelteDrawUiMenuContextProvider.svelte'
</script>

<SvelteDrawUiMenuContextProvider type="keyboard-shortcuts" sourceId="kbd">
	<EditMenuSubmenu />
	<ArrangeMenuSubmenu />
	<ReorderMenuSubmenu />
</SvelteDrawUiMenuContextProvider>
