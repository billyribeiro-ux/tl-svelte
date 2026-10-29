<script lang="ts">
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import { createTransientMessage, getResponseError } from './shared.svelte'

	let input = $state<HTMLInputElement | null>(null)
	let error = $state<string | null>(null)
	const successMessage = createTransientMessage()

	async function onDelete() {
		const fileId = input?.value
		if (!fileId) {
			error = 'Please enter a file ID'
			return
		}

		if (
			!window.confirm(
				`Are you sure you want to permanently delete file ${fileId}? This action cannot be undone.`
			)
		) {
			return
		}

		error = null
		successMessage.set(null)
		const res = await fetch(`/api/app/admin/hard_delete_file/${fileId}`, {
			method: 'POST',
		})
		if (!res.ok) {
			error = await getResponseError(res)
			return
		}
		successMessage.set('File deleted successfully! 🧹')
		input!.value = ''
	}
</script>

<div class={styles.dangerZone}>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	{#if successMessage.current}<div class={styles.successMessage}>{successMessage.current}</div>{/if}
	<div class={styles.deleteContainer}>
		<input type="text" placeholder="File ID" bind:this={input} class={styles.searchInput} />
		<AdminButton onclick={onDelete} variant="danger" class={styles.deleteButton}>
			Delete (cannot be undone)
		</AdminButton>
	</div>
</div>
