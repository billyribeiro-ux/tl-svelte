<script lang="ts" module>
	import type { TLUserId } from '@svelte-draw/editor'

	/** @public */
	export interface DefaultPeopleMenuContentProps {
		userIds: TLUserId[]
	}
</script>

<script lang="ts">
	import { getUiComponents } from '../../context/components'

	let { userIds }: DefaultPeopleMenuContentProps = $props()

	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()
</script>

{#if components.UserPresenceEditor}
	{@const UserPresenceEditor = components.UserPresenceEditor}
	<div class="tlui-people-menu__section">
		<UserPresenceEditor />
	</div>
{/if}
{#if components.PeopleMenuItem && userIds.length > 0}
	{@const PeopleMenuItem = components.PeopleMenuItem}
	<div class="tlui-people-menu__section">
		{#each userIds as userId (userId + '_presence')}
			<PeopleMenuItem {userId} />
		{/each}
	</div>
{/if}
