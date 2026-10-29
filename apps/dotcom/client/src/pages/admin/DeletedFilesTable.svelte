<script lang="ts" module>
	import type { TlaFile } from '@svelte-draw/dotcom-shared'

	export type DeletedFileRow = TlaFile & {
		workspaceName: string | null
		workspaceRole: string | null
	}
</script>

<script lang="ts">
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import { getResponseError } from './shared.svelte'

	let {
		files,
		userId,
		onUndeleted,
	}: {
		files: DeletedFileRow[]
		userId: string
		onUndeleted(): void
	} = $props()

	let busyId = $state<string | null>(null)
	let error = $state<string | null>(null)

	async function onUndelete(file: DeletedFileRow) {
		if (
			!window.confirm(`Undelete "${file.name || file.id}"? It will reappear in the owner's sidebar.`)
		) {
			return
		}
		busyId = file.id
		error = null
		try {
			const res = await fetch(`/api/app/admin/undelete_file/${encodeURIComponent(file.id)}`, {
				method: 'POST',
			})
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			onUndeleted()
		} finally {
			busyId = null
		}
	}
</script>

{#if files.length > 0}
	<div class={styles.fileOperation}>
		<h4 class={styles.subTitle}>Deleted files</h4>
		{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
		<div class={styles.tableScroll}>
			<table class={`${styles.diagnosticsTable} ${styles.fitTable}`}>
				<thead>
					<tr>
						<th>Name</th>
						<th>File ID</th>
						<th>Workspace</th>
						<th>Role</th>
						<th>Updated</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each files as file (file.id)}
						<tr>
							<td>{file.name || 'Untitled'}</td>
							<td class={styles.fileIdCell} title={file.id}>
								{file.id}
							</td>
							<td>{file.owningGroupId === userId ? 'Home' : (file.workspaceName ?? '—')}</td>
							<td>{file.workspaceRole ?? '—'}</td>
							<td>{new Date(file.updatedAt).toLocaleString()}</td>
							<td>
								<AdminButton
									variant="secondary"
									class={styles.btnCompact}
									disabled={busyId !== null}
									isLoading={busyId === file.id}
									onclick={() => onUndelete(file)}
								>
									Undelete
								</AdminButton>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}
