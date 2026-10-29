<script lang="ts">
	import { createAnySelectedShapesCount, createSomeActionsEnabled } from '../../hooks'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
	import { EDIT_ACTIONS, messages } from './constants'

	// The selection check keeps an action replaced without isEnabled from opening the submenu on
	// an empty canvas.
	const hasSelection = createAnySelectedShapesCount(1)
	const show = createSomeActionsEnabled(() => EDIT_ACTIONS)
</script>

{#if hasSelection.current && show.current}
	<SvelteDrawUiMenuSubmenu id="edit" label={messages.contextMenuEdit.id} size="small">
		{#each EDIT_ACTIONS as id (id)}
			<SvelteDrawUiMenuActionItem actionId={id} whenDisabled="hide" />
		{/each}
	</SvelteDrawUiMenuSubmenu>
{/if}
