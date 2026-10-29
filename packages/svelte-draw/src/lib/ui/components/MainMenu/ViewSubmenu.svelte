<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		menuView: { id: 'menu.view', defaultMessage: 'View' },
	})
</script>

<script lang="ts">
	import ZoomTo100MenuItem from '../menu-items/ZoomTo100MenuItem.svelte'
	import ZoomToFitMenuItem from '../menu-items/ZoomToFitMenuItem.svelte'
	import ZoomToSelectionMenuItem from '../menu-items/ZoomToSelectionMenuItem.svelte'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'

</script>

<SvelteDrawUiMenuSubmenu id="view" label={messages.menuView.id}>
	<SvelteDrawUiMenuGroup id="view-actions">
		<SvelteDrawUiMenuActionItem actionId="zoom-in" />
		<SvelteDrawUiMenuActionItem actionId="zoom-out" />
		<ZoomTo100MenuItem />
		<ZoomToFitMenuItem />
		<ZoomToSelectionMenuItem />
	</SvelteDrawUiMenuGroup>
</SvelteDrawUiMenuSubmenu>
