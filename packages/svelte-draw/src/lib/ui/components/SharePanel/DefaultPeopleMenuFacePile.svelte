<script lang="ts" module>
	import type { TLUserId } from '@svelte-draw/editor'

	/** @public */
	export interface TLUiPeopleMenuFacePileProps {
		userIds: TLUserId[]
		userName: string
		userColor: string
	}
</script>

<script lang="ts">
	import { getFirstCharacter } from '@svelte-draw/editor'
	import { PORTRAIT_BREAKPOINT } from '../../constants'
	import { getBreakpoint } from '../../context/breakpoints'
	import { getUiComponents } from '../../context/components'

	let { userIds, userName, userColor }: TLUiPeopleMenuFacePileProps = $props()

	// Read through the object (not destructured) so an override that changes follows.
	const components = getUiComponents()

	const breakpoint = getBreakpoint()
	const maxAvatars = $derived(breakpoint.current <= PORTRAIT_BREAKPOINT.MOBILE_XS ? 1 : 5)
</script>

<div class="tlui-people-menu__avatars">
	{#if components.PeopleMenuAvatar}
		{@const PeopleMenuAvatar = components.PeopleMenuAvatar}
		{#each userIds.slice(-maxAvatars) as userId (userId)}
			<PeopleMenuAvatar {userId} />
		{/each}
	{/if}
	{#if userIds.length > 0}
		<div class="tlui-people-menu__avatar" style:background-color={userColor}>
			{getFirstCharacter(userName ?? '')}
		</div>
	{/if}
	{#if userIds.length > maxAvatars}
		<div class="tlui-people-menu__avatar tlui-people-menu__more">
			{userIds.length - maxAvatars}
		</div>
	{/if}
</div>
