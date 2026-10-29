<script lang="ts">
	import { fromSignal, SvelteDrawUiButton } from 'svelte-draw'
	import { currentUserIdAtom, USERS } from './timelineUsers'

	const activeUserId = fromSignal(currentUserIdAtom)
</script>

<div class="tlui-menu attribution-timeline-user-switcher">
	{#each Object.values(USERS) as user (user.id)}
		<SvelteDrawUiButton
			type={activeUserId.current === user.id ? 'primary' : 'normal'}
			onclick={() => currentUserIdAtom.set(user.id)}
		>
			<span class="attribution-timeline-dot" style:background-color={user.color}></span>
			{user.name}
		</SvelteDrawUiButton>
	{/each}
</div>
