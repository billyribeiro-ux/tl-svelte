<script lang="ts">
	import { createSomeActionsEnabled, createUnlockedSelectedShapesCount } from '../../hooks'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
	import ActionGroup from './ActionGroup.svelte'
	import { REORDER_ACTIONS } from './constants'

	const hasSelection = createUnlockedSelectedShapesCount(1)
	const show = createSomeActionsEnabled(() => REORDER_ACTIONS)
</script>

{#if hasSelection.current && show.current}
	<SvelteDrawUiMenuSubmenu id="reorder" label="context-menu.reorder" size="small">
		<ActionGroup id="reorder" actionIds={REORDER_ACTIONS} />
	</SvelteDrawUiMenuSubmenu>
{/if}
