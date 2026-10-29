<script lang="ts">
	import type {
		AdminOutboxRow,
		AdminOutboxRowsResponseBody,
		AdminOutboxStatsResponseBody,
	} from '@svelte-draw/dotcom-shared'
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import OutboxRowView from './OutboxRowView.svelte'
	import { getResponseError } from './shared.svelte'

	let stats = $state<AdminOutboxStatsResponseBody['outbox'] | null>(null)
	let rows = $state.raw<AdminOutboxRow[] | null>(null)
	let expandedId = $state<number | null>(null)
	let error = $state<string | null>(null)
	let isLoading = $state(true)
	let busyId = $state<number | null>(null)

	async function load() {
		isLoading = true
		error = null
		try {
			const [statsRes, rowsRes] = await Promise.all([
				fetch('/api/app/admin/outbox'),
				fetch('/api/app/admin/outbox/rows'),
			])
			const failed = [statsRes, rowsRes].find((res) => !res.ok)
			if (failed) {
				error = await getResponseError(failed)
				return
			}
			const statsData = (await statsRes.json()) as AdminOutboxStatsResponseBody
			const rowsData = (await rowsRes.json()) as AdminOutboxRowsResponseBody
			stats = statsData.outbox
			rows = rowsData.rows
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load the outbox'
		} finally {
			isLoading = false
		}
	}

	$effect(() => {
		load()
	})

	async function runRowAction(id: number, action: 'retry' | 'delete') {
		const label = action === 'retry' ? 'Retry' : 'Delete'
		busyId = id
		error = null
		try {
			const res = await fetch(`/api/app/admin/outbox/${id}/${action}`, { method: 'POST' })
			if (!res.ok) {
				if (res.status === 404) {
					// A concurrent drain already consumed the row; refresh to show its current state.
					await load()
					error = 'Row already gone - refreshed'
					return
				}
				const text = await res.text().catch(() => '')
				error = `${label} failed: ${res.status} ${text}`
				return
			}
			await load()
		} catch (err) {
			error = err instanceof Error ? `${label} failed: ${err.message}` : `${label} failed`
		} finally {
			busyId = null
		}
	}
</script>

<section class={styles.adminSection}>
	<div class={styles.searchContainer}>
		<h3 class={styles.sectionTitle}>Effect outbox</h3>
		<AdminButton onclick={load} variant="secondary" {isLoading}>Refresh</AdminButton>
	</div>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	{#if stats}
		<p class={styles.adminReleaseMeta}>
			<span class={styles.adminReleaseLabel}>Pending:</span>
			{stats.pending}
			{' · '}
			<span class={styles.adminReleaseLabel}>Parked:</span>
			{stats.parked}
			{' · '}
			<span class={styles.adminReleaseLabel}>Oldest pending age:</span>{' '}
			{stats.oldestPendingAgeSeconds === null ? 'n/a' : `${stats.oldestPendingAgeSeconds}s`}
		</p>
	{/if}
	{#if rows && rows.length === 0}<p>No pending effects</p>{/if}
	{#if rows && rows.length > 0}
		<div class={styles.tableScroll}>
			<table class={styles.diagnosticsTable}>
				<thead>
					<tr>
						<th>Id</th>
						<th>Entity</th>
						<th>Command</th>
						<th>Change</th>
						<th>Attempts</th>
						<th>Age</th>
						<th>Next retry</th>
						<th>Last error</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.id)}
						<OutboxRowView
							{row}
							expanded={expandedId === row.id}
							busy={busyId === row.id}
							onToggle={() => {
								expandedId = expandedId === row.id ? null : row.id
							}}
							onRetry={() => runRowAction(row.id, 'retry')}
							onDelete={() => {
								if (!window.confirm(`Delete outbox row ${row.id}? This cannot be undone.`)) return
								runRowAction(row.id, 'delete')
							}}
						/>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
