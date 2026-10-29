<script lang="ts">
	import { createSomeActionsEnabled, createUnlockedSelectedShapesCount } from '../../hooks'
	import SvelteDrawUiMenuSubmenu from '../primitives/menus/SvelteDrawUiMenuSubmenu.svelte'
	import ActionGroup from './ActionGroup.svelte'
	import { ARRANGE_ACTIONS, ARRANGE_GROUPS, messages } from './constants'

	const hasSelection = createUnlockedSelectedShapesCount(1)
	const show = createSomeActionsEnabled(() => ARRANGE_ACTIONS)
</script>

{#if hasSelection.current && show.current}
	<SvelteDrawUiMenuSubmenu id="arrange" label={messages.contextMenuArrange.id} size="small">
		{#each ARRANGE_GROUPS as group (group.id)}
			<ActionGroup id={group.id} actionIds={group.actionIds} />
		{/each}
	</SvelteDrawUiMenuSubmenu>
{/if}
