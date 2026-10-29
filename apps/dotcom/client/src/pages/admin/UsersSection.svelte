<script lang="ts">
	import type { TlaFile, TlaUser } from '@svelte-draw/dotcom-shared'
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import DeleteUser from './DeleteUser.svelte'
	import DeletedFilesTable, { type DeletedFileRow } from './DeletedFilesTable.svelte'
	import { createTransientMessage, getResponseError } from './shared.svelte'
	import StructuredDataDisplay from './StructuredDataDisplay.svelte'
	import UserDataSummary from './UserDataSummary.svelte'

	let data = $state.raw<{ user: TlaUser; memberships: unknown[]; files: TlaFile[] } | null>(null)
	let deletedFiles = $state.raw<DeletedFileRow[]>([])
	let error = $state<string | null>(null)
	const successMessage = createTransientMessage()
	let input = $state<HTMLInputElement | null>(null)

	// The user's replicated store filters out their own deleted files, so the deleted-files
	// list comes from a dedicated Postgres-backed endpoint.
	async function loadDeletedFiles() {
		const q = input?.value?.trim() ?? ''
		if (!q) return
		const res = await fetch(`/api/app/admin/user/deleted_files?${new URLSearchParams({ q })}`)
		if (!res.ok) {
			error = await getResponseError(res)
			return
		}
		deletedFiles = (await res.json()) as DeletedFileRow[]
	}

	async function loadData() {
		const q = input?.value?.trim() ?? ''
		if (!q) {
			error = 'Please enter an email or ID'
			return
		}

		error = null
		successMessage.set(null)
		deletedFiles = []

		const res = await fetch(`/api/app/admin/user?${new URLSearchParams({ q })}`)
		if (!res.ok) {
			error = await getResponseError(res)
			return
		}
		data = await res.json()
		await loadDeletedFiles()
	}
</script>

<!-- User Search Section -->
<section class={styles.adminSection}>
	<h2 class={styles.sectionTitle}>User management</h2>
	<p>
		Look up a user by email or ID to inspect their data, restore deleted files, or delete the
		account.
	</p>
	<div class={styles.searchContainer}>
		<input
			bind:this={input}
			type="text"
			placeholder="Email or ID"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					loadData()
				}
			}}
			class={styles.searchInput}
		/>
		<AdminButton onclick={loadData} variant="primary">Find user</AdminButton>
	</div>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	{#if successMessage.current}<div class={styles.successMessage}>{successMessage.current}</div>{/if}
</section>

<!-- User Data Section -->
{#if data}
	<section class={styles.adminSection}>
		<h3 class={styles.sectionTitle}>User data</h3>
		<UserDataSummary {data} deletedFileCount={deletedFiles.length} />
		<div class={styles.userActions}>
			<AdminButton
				onclick={() => {
					navigator.clipboard.writeText(JSON.stringify(data, null, 2))
					successMessage.set('User data copied to clipboard')
				}}
				variant="secondary"
			>
				Copy data
			</AdminButton>
		</div>
		<DeletedFilesTable files={deletedFiles} userId={data.user?.id} onUndeleted={loadData} />
		<StructuredDataDisplay {data} />
	</section>
{/if}

<!-- Danger Zone Section -->
<section class={styles.adminSection}>
	<h3 class={styles.sectionTitle}>Danger zone</h3>
	<DeleteUser />
</section>
