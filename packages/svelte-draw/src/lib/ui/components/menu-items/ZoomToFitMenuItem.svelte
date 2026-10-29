<script lang="ts">
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
</script>

<!-- The React original also passed a `minimap.zoom-menu.zoom-to-fit` test id here, but the item never rendered it, so it is omitted. -->
<SvelteDrawUiMenuActionItem actionId="zoom-to-fit" noClose />
