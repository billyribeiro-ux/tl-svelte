<script lang="ts">
	import { fromSignal, getEditor } from 'svelte-draw'
	import { asCustomMeta } from './customUsers'

	const editor = getEditor()

	const currentUserValue = fromSignal(editor.store.props.users.currentUser)
	const currentUser = $derived(currentUserValue.current)
	const customMeta = $derived(asCustomMeta(currentUser))
</script>

<div class="custom-user-panel">
	{#if currentUser && customMeta}
		<div class="custom-user-header">
			<span class="custom-user-dot-lg" style:background-color={currentUser.color}></span>
			<span class="custom-user-name">{currentUser.name}</span>
			{#if customMeta.isAdmin}<span class="custom-user-badge">Admin</span>{/if}
		</div>
		<div class="custom-user-row">
			<span class="custom-user-label">Department</span>
			<span>{customMeta.department}</span>
		</div>
		<div class="custom-user-row">
			<span class="custom-user-label">Role</span>
			<span>{customMeta.isAdmin ? 'Administrator' : 'Member'}</span>
		</div>
	{:else}
		<div class="custom-user-hint">No user selected</div>
	{/if}
</div>
