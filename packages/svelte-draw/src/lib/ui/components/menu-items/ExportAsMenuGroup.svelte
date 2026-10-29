<script lang="ts">
	import { getActions } from '../../context'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
	import { messages } from './constants'
	import ToggleTransparentBgMenuItem from './ToggleTransparentBgMenuItem.svelte'

	const actions = getActions()
</script>

<!-- If a consumer has removed the export actions via `overrides`, don't render an empty submenu. -->
{#if actions['export-as-svg'] || actions['export-as-png']}
	<SvelteDrawUiMenuSubmenu id="export-as" label={messages.contextMenuExportAs.id} size="small">
		<SvelteDrawUiMenuGroup id="export-as-group">
			<SvelteDrawUiMenuActionItem actionId="export-as-svg" />
			<SvelteDrawUiMenuActionItem actionId="export-as-png" />
		</SvelteDrawUiMenuGroup>
		<SvelteDrawUiMenuGroup id="export-as-bg">
			<ToggleTransparentBgMenuItem />
		</SvelteDrawUiMenuGroup>
	</SvelteDrawUiMenuSubmenu>
{/if}
