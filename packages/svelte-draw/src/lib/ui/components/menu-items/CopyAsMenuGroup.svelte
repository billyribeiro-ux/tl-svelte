<script lang="ts">
	import { createHasShapesOnPage, createSomeActionsAvailable } from '../../hooks'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
	import { COPY_AS_ACTIONS, messages } from './constants'
	import ToggleTransparentBgMenuItem from './ToggleTransparentBgMenuItem.svelte'

	const atLeastOneShapeOnPage = createHasShapesOnPage()
	const hasCopyActions = createSomeActionsAvailable(() => COPY_AS_ACTIONS)
</script>

{#if hasCopyActions.current}
	<SvelteDrawUiMenuSubmenu
		id="copy-as"
		label={messages.contextMenuCopyAs.id}
		size="small"
		disabled={!atLeastOneShapeOnPage.current}
	>
		<SvelteDrawUiMenuGroup id="copy-as-group">
			{#each COPY_AS_ACTIONS as id (id)}
				<SvelteDrawUiMenuActionItem actionId={id} />
			{/each}
		</SvelteDrawUiMenuGroup>
		<SvelteDrawUiMenuGroup id="copy-as-bg">
			<ToggleTransparentBgMenuItem />
		</SvelteDrawUiMenuGroup>
	</SvelteDrawUiMenuSubmenu>
{/if}
