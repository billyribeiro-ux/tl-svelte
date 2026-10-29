<script lang="ts">
	import { fromSignal, SvelteDrawUiButton } from 'svelte-draw'
	import { currentUserIdAtom, usersAtom } from './attributionUsers'

	// [3]
	const allUsers = fromSignal(usersAtom)
	const activeUserId = fromSignal(currentUserIdAtom)
	const activeUser = $derived(allUsers.current[activeUserId.current])
</script>

<div class="tlui-menu attribution-controls">
	{#each Object.values(allUsers.current) as user (user.id)}
		<SvelteDrawUiButton
			type={activeUserId.current === user.id ? 'primary' : 'normal'}
			onclick={() => currentUserIdAtom.set(user.id)}
		>
			<span class="attribution-dot" style:background-color={user.color}></span>
			{user.name}
		</SvelteDrawUiButton>
	{/each}
	{#if activeUser}
		<input
			class="attribution-name-input"
			value={activeUser.name}
			oninput={(e) => {
				const name = e.currentTarget.value
				const id = activeUserId.current
				usersAtom.update((prev) => ({
					...prev,
					[id]: { ...prev[id], name },
				}))
			}}
			onpointerdown={(e) => e.stopPropagation()}
			placeholder="Edit name…"
		/>
	{/if}
</div>
