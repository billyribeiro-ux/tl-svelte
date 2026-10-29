<script lang="ts" module>
	import type { AdminOutboxRow, TlaFile } from '@svelte-draw/dotcom-shared'

	// Human-readable summary of what a row's effect represents, diffing the same columns
	// the file trigger considers effect-relevant.
	export function describeChange(row: AdminOutboxRow): string {
		if (row.command === 'insert') return 'created'
		if (row.command === 'delete') return 'hard-deleted'
		const prev = row.prevPayload as Partial<TlaFile> | null
		const next = row.payload as Partial<TlaFile> | null
		if (!prev || !next) return 'updated'
		const changes: string[] = []
		if (prev.isDeleted !== next.isDeleted) changes.push(next.isDeleted ? 'trashed' : 'restored')
		if (prev.name !== next.name) changes.push(`renamed "${prev.name}" → "${next.name}"`)
		if (prev.published !== next.published) {
			changes.push(next.published ? 'published' : 'unpublished')
		} else if (next.published && prev.lastPublished !== next.lastPublished) {
			changes.push('republished')
		}
		if (prev.publishedSlug !== next.publishedSlug) changes.push('publish slug changed')
		if (prev.shared !== next.shared) changes.push(next.shared ? 'shared' : 'unshared')
		if (prev.sharedLinkType !== next.sharedLinkType) {
			changes.push(`link type → ${next.sharedLinkType}`)
		}
		if (prev.owningGroupId !== next.owningGroupId) {
			changes.push('ownership moved')
		}
		return changes.length ? changes.join(', ') : 'updated'
	}
</script>

<script lang="ts">
	import { truncateStringWithEllipsis } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'

	let {
		row,
		expanded,
		busy,
		onToggle,
		onRetry,
		onDelete,
	}: {
		row: AdminOutboxRow
		expanded: boolean
		busy: boolean
		onToggle(): void
		onRetry(): void
		onDelete(): void
	} = $props()

	const attemptsClass = $derived(
		row.parked ? styles.attemptsParked : row.attempts > 0 ? styles.attemptsWarn : undefined
	)
</script>

<tr class={styles.clickableRow} onclick={onToggle}>
	<td>{row.id}</td>
	<td class={styles.fileIdCell}>
		{row.tableName}:{row.entityId}
	</td>
	<td>{row.command}</td>
	<td>{describeChange(row)}</td>
	<td class={attemptsClass}>
		{row.attempts}
		{row.parked ? ' (parked)' : ''}
	</td>
	<td>{row.ageSeconds}s</td>
	<td>{row.nextRetryAt ? new Date(row.nextRetryAt).toLocaleString() : 'n/a'}</td>
	<td title={row.lastError ?? undefined}>
		{row.lastError ? truncateStringWithEllipsis(row.lastError, 60) : ''}
	</td>
	<td onclick={(e) => e.stopPropagation()}>
		<AdminButton onclick={onRetry} variant="secondary" class={styles.btnCompact} isLoading={busy}>
			Retry now
		</AdminButton>{' '}
		<AdminButton onclick={onDelete} variant="danger" class={styles.btnCompact} isLoading={busy}>
			Delete
		</AdminButton>
	</td>
</tr>
{#if expanded}
	<tr>
		<td colspan={9}>
			<div class={styles.outboxDetails}>
				<div class={styles.outboxDetailsColumn}>
					<div class={styles.fieldLabel}>Payload</div>
					<pre class={styles.dataDisplay}>{JSON.stringify(row.payload, null, 2)}</pre>
				</div>
				<div class={styles.outboxDetailsColumn}>
					<div class={styles.fieldLabel}>Prev payload</div>
					<pre class={styles.dataDisplay}>{JSON.stringify(row.prevPayload, null, 2)}</pre>
				</div>
				<div class={styles.outboxDetailsColumn}>
					<div class={styles.fieldLabel}>Current entity</div>
					<pre class={styles.dataDisplay}>{JSON.stringify(row.currentEntity, null, 2)}</pre>
				</div>
			</div>
		</td>
	</tr>
{/if}
