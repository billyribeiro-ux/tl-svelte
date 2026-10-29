<script lang="ts">
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'

	let input = $state<HTMLInputElement | null>(null)
	let isDeleting = $state(false)
	let progressLog = $state.raw<string[]>([])
	let error = $state<string | null>(null)
	let isComplete = $state(false)

	async function onDelete() {
		const userId = input?.value?.trim()
		if (!userId) {
			error = 'Please enter a user ID or email'
			return
		}

		if (
			!window.confirm(
				`Are you sure you want to permanently delete user "${userId}"? This action cannot be undone and will delete all their files, data, and account.`
			)
		) {
			return
		}

		isDeleting = true
		error = null
		progressLog = [] // Only clear log when starting a new deletion
		isComplete = false

		// fetch rather than EventSource: the endpoint is a POST (EventSource can only issue GETs),
		// so the SSE frames are parsed off the response body here.
		try {
			const response = await fetch(
				`/api/app/admin/delete_user_sse?q=${encodeURIComponent(userId)}`,
				{ method: 'POST' }
			)
			if (!response.ok || !response.body) {
				throw new Error(`Delete failed: ${response.status}`)
			}

			const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
			// Frames are separated by a blank line and can be split across reads, so hold the
			// trailing partial frame until the rest of it arrives.
			let buffer = ''
			for (;;) {
				const { done, value } = await reader.read()
				if (done) break
				buffer += value

				let boundary = buffer.indexOf('\n\n')
				for (; boundary !== -1; boundary = buffer.indexOf('\n\n')) {
					const frame = buffer.slice(0, boundary)
					buffer = buffer.slice(boundary + 2)
					if (!frame.startsWith('data: ')) continue

					const data = JSON.parse(frame.slice('data: '.length))
					const timestamp = new Date(data.timestamp).toLocaleTimeString()
					progressLog = [...progressLog, `[${timestamp}] ${data.message}`]

					if (data.type === 'complete') {
						isComplete = true
					} else if (data.type === 'error') {
						error = data.message
					}
				}
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error occurred'
		} finally {
			isDeleting = false
		}
	}
</script>

<div class={styles.dangerZone}>
	<h4 class={styles.subTitle}>Delete user</h4>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	{#if isComplete}<div class={styles.successMessage}>User deleted successfully! 🧹</div>{/if}

	<div class={styles.deleteContainer}>
		<input
			type="text"
			placeholder="User ID or Email"
			bind:this={input}
			class={styles.searchInput}
			disabled={isDeleting}
		/>
		<AdminButton
			onclick={onDelete}
			variant="danger"
			class={styles.deleteButton}
			disabled={isDeleting}
			isLoading={isDeleting}
		>
			{isDeleting ? 'Deleting...' : 'Delete user (cannot be undone)'}
		</AdminButton>
	</div>

	<!-- Progress Log -->
	{#if progressLog.length > 0}
		<div class={styles.progressLog}>
			<h5>Deletion progress</h5>
			<div class={styles.logContainer}>
				{#each progressLog as log, index (index)}
					<div class={styles.logEntry}>
						{log}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
