<script lang="ts">
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'

	let isCreating = $state(false)

	async function handleCreate() {
		isCreating = true
		try {
			const res = await fetch(`/api/app/admin/create_legacy_file`, { method: 'POST' })
			const { slug } = await res.json()
			window.open(`/r/${slug}`, '_blank')?.focus()
		} catch (err) {
			console.error('Failed to create legacy file:', err)
		} finally {
			isCreating = false
		}
	}
</script>

<div class={styles.fileOperation}>
	<p>Creates an empty legacy multiplayer room and opens it.</p>
	<AdminButton onclick={handleCreate} variant="primary" isLoading={isCreating}>
		Create legacy file
	</AdminButton>
</div>
