<script lang="ts">
	import { fromSignal, SvelteDrawUiButton } from 'svelte-draw'
	import { currentUserIdAtom, usersAtom } from './customUsers'

	const allUsers = fromSignal(usersAtom)
	const activeUserId = fromSignal(currentUserIdAtom)
</script>

<div class="tlui-menu custom-user-controls">
	{#each Object.values(allUsers.current) as user (user.id)}
		<SvelteDrawUiButton
			type={activeUserId.current === user.id ? 'primary' : 'normal'}
			onclick={() => currentUserIdAtom.set(user.id)}
		>
			<span class="custom-user-dot" style:background-color={user.color}></span>
			{user.name}
		</SvelteDrawUiButton>
	{/each}
</div>
