<script lang="ts">
	import DefaultMainMenu from '../../../lib/ui/components/MainMenu/DefaultMainMenu.svelte'
	import SvelteDrawUiMenuActionCheckboxItem from '../../../lib/ui/components/primitives/menus/SvelteDrawUiMenuActionCheckboxItem.svelte'
</script>

<DefaultMainMenu>
	<SvelteDrawUiMenuActionCheckboxItem actionId="test-toggle" />
	<SvelteDrawUiMenuActionCheckboxItem actionId="toggle-snap-mode" checked />
	<SvelteDrawUiMenuActionCheckboxItem actionId="toggle-wrap-mode" disabled whenDisabled="hide" />
</DefaultMainMenu>
