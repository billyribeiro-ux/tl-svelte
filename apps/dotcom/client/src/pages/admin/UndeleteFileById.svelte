<script lang="ts">
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import { createTransientMessage, getResponseError } from './shared.svelte'

	let input = $state<HTMLInputElement | null>(null)
	let error = $state<string | null>(null)
	const successMessage = createTransientMessage()
	let isLoading = $state(false)

	async function onUndelete() {
		const fileId = input?.value?.trim()
		if (!fileId) {
			error = 'Please enter a file ID'
			return
		}
		if (!window.confirm(`Undelete file ${fileId}?`)) return
		error = null
		successMessage.set(null)
		isLoading = true
		try {
			const res = await fetch(`/api/app/admin/undelete_file/${encodeURIComponent(fileId)}`, {
				method: 'POST',
			})
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			successMessage.set('File undeleted')
			input!.value = ''
		} finally {
			isLoading = false
		}
	}
</script>

<div class={styles.fileOperation}>
	<p>Restores a soft-deleted file by ID.</p>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	{#if successMessage.current}<div class={styles.successMessage}>{successMessage.current}</div>{/if}
	<div class={styles.searchContainer}>
		<input type="text" placeholder="File ID" bind:this={input} class={styles.searchInput} />
		<AdminButton onclick={onUndelete} variant="primary" {isLoading}>Undelete</AdminButton>
	</div>
</div>
