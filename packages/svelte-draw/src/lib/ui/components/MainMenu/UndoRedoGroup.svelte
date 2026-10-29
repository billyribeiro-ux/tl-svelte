<script lang="ts">
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
</script>

<SvelteDrawUiMenuGroup id="undo-redo">
	<SvelteDrawUiMenuActionItem actionId="undo" />
	<SvelteDrawUiMenuActionItem actionId="redo" />
</SvelteDrawUiMenuGroup>
