<script lang="ts" module>
	/** @internal */
	export interface ActionGroupProps {
		id: string
		actionIds: string[]
	}
</script>

<script lang="ts">
	import { createSomeActionsEnabled } from '../../hooks'
	import SvelteDrawUiMenuActionItem from '../primitives/menus/SvelteDrawUiMenuActionItem.svelte'
	import SvelteDrawUiMenuGroup from '../primitives/menus/SvelteDrawUiMenuGroup.svelte'

	let { id, actionIds }: ActionGroupProps = $props()

	const show = createSomeActionsEnabled(() => actionIds)
</script>

{#if show.current}
	<SvelteDrawUiMenuGroup {id}>
		{#each actionIds as actionId (actionId)}
			<SvelteDrawUiMenuActionItem {actionId} whenDisabled="hide" />
		{/each}
	</SvelteDrawUiMenuGroup>
{/if}
