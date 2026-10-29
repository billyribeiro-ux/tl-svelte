<script lang="ts">
	import type { TlaFile, TlaUser } from '@svelte-draw/dotcom-shared'
	import styles from './admin.module.css'

	// Helper component for user data summary. deletedFileCount comes from the dedicated endpoint —
	// `data.files` excludes the user's own deleted files, so it can't be derived from `data`.
	let {
		data,
		deletedFileCount,
	}: {
		data: { user: TlaUser; memberships: unknown[]; files: TlaFile[] }
		deletedFileCount: number
	} = $props()

	const rows = $derived.by(() => {
		const { user } = data
		const files = data.files || []
		return [
			['Name', user?.name || 'Unknown'],
			['Email', user?.email || 'No email'],
			['Active Files', files.filter((f) => !f.isDeleted).length],
			['Deleted Files', deletedFileCount],
		] as const
	})
</script>

<div class={styles.userSummary}>
	<div class={styles.summaryGrid}>
		{#each rows as [label, value] (label)}
			<div class={styles.summaryItem}>
				<span class={styles.fieldLabel}>{label}:</span>
				<span class={styles.fieldValue}>{value}</span>
			</div>
		{/each}
	</div>
</div>
