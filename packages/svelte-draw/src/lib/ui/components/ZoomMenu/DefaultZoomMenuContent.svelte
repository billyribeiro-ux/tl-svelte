<script lang="ts">
	import ZoomTo100MenuItem from '../menu-items/ZoomTo100MenuItem.svelte'
	import ZoomToFitMenuItem from '../menu-items/ZoomToFitMenuItem.svelte'
	import ZoomToSelectionMenuItem from '../menu-items/ZoomToSelectionMenuItem.svelte'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
</script>

<SvelteDrawUiMenuActionItem actionId="zoom-in" noClose />
<SvelteDrawUiMenuActionItem actionId="zoom-out" noClose />
<ZoomTo100MenuItem />
<ZoomToFitMenuItem />
<ZoomToSelectionMenuItem />
