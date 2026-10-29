<script lang="ts" module>
	import { defineMessages } from '@svelte-draw/editor'

	const messages = defineMessages({
		contextMenuExportAllAs: { id: 'context-menu.export-all-as', defaultMessage: 'Export' },
	})
</script>

<script lang="ts">
	import { getActions } from '../../context'
	import ToggleTransparentBgMenuItem from '../menu-items/ToggleTransparentBgMenuItem.svelte'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'

	const actions = getActions()
</script>

<!-- If a consumer has removed the export actions via `overrides`, don't render an empty submenu. -->
{#if actions['export-all-as-svg'] || actions['export-all-as-png']}
	<SvelteDrawUiMenuSubmenu id="export-all-as" label={messages.contextMenuExportAllAs.id} size="small">
		<SvelteDrawUiMenuGroup id="export-all-as-group">
			<SvelteDrawUiMenuActionItem actionId="export-all-as-svg" />
			<SvelteDrawUiMenuActionItem actionId="export-all-as-png" />
		</SvelteDrawUiMenuGroup>
		<SvelteDrawUiMenuGroup id="export-all-as-bg">
			<ToggleTransparentBgMenuItem />
		</SvelteDrawUiMenuGroup>
	</SvelteDrawUiMenuSubmenu>
{/if}
