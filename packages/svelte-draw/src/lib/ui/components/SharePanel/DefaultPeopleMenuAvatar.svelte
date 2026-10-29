<script lang="ts" module>
	import type { TLUserId } from '@svelte-draw/editor'

	/** @public */
	export interface TLUiPeopleMenuAvatarProps {
		userId: TLUserId
	}
</script>

<script lang="ts">
	import { getFirstCharacter } from '@svelte-draw/editor'
	import { usePresence } from '@svelte-draw/svelte'

	let { userId }: TLUiPeopleMenuAvatarProps = $props()

	const presence = usePresence(() => userId)
</script>

{#if presence.current}
	<div class="tlui-people-menu__avatar" style:background-color={presence.current.color}>
		{getFirstCharacter(presence.current.userName ?? '')}
	</div>
{/if}
