<script lang="ts">
	import type { AdminFileAssetsResponseBody } from '@svelte-draw/dotcom-shared'
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import { formatBytes, formatTally, getResponseError } from './shared.svelte'
	import StructuredDataDisplay from './StructuredDataDisplay.svelte'

	let input = $state<HTMLInputElement | null>(null)
	let error = $state<string | null>(null)
	let isLoading = $state(false)
	let report = $state.raw<AdminFileAssetsResponseBody | null>(null)

	async function onCheck() {
		const slug = input?.value?.trim()
		if (!slug) {
			error = 'Please enter a file slug'
			return
		}
		error = null
		report = null
		isLoading = true
		try {
			const res = await fetch(`/api/app/admin/file-assets/${encodeURIComponent(slug)}`)
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			report = (await res.json()) as AdminFileAssetsResponseBody
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to check assets'
		} finally {
			isLoading = false
		}
	}

	const summary = $derived.by((): Array<[string, string | number]> => {
		if (!report) return []
		return [
			[
				'Shapes',
				`${report.shapes.total}${
					report.shapes.total > 0 ? ` (${formatTally(report.shapes.byType)})` : ''
				}`,
			],
			['Total assets', report.assets.total],
			[
				'Asset size',
				`${formatBytes(report.assets.totalSizeBytes)} (largest ${formatBytes(report.assets.largestSizeBytes)})`,
			],
			['Associated', report.assets.associated],
			['Pending association', report.assets.pending],
			['External (bookmarks etc.)', report.assets.external],
			['Missing in bucket', report.assets.missingInBucket],
			['Head check failures', report.assets.headFailures],
			['Old-format URLs', report.assets.oldFormatUrls],
			['DB asset rows', `${report.dbRows.forThisFile} (${report.dbRows.orphaned} orphaned)`],
			[
				'Create source',
				report.source
					? `${report.source.raw} ${
							report.source.exists === null
								? '(not checked)'
								: report.source.exists
									? '(exists)'
									: '⚠️ (missing)'
						}`
					: 'none',
			],
		]
	})
</script>

<div class={styles.fileOperation}>
	<p>
		Checks whether each asset in the file&apos;s last persisted snapshot exists in the uploads
		bucket and is associated with the file.
	</p>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	<div class={styles.searchContainer}>
		<input
			type="text"
			placeholder="File slug"
			bind:this={input}
			class={styles.searchInput}
			onkeydown={(e) => {
				if (e.key === 'Enter') onCheck()
			}}
		/>
		<AdminButton onclick={onCheck} variant="primary" {isLoading}>Check assets</AdminButton>
	</div>
	{#if report}
		{#if report.warnings.length > 0}
			<div class={styles.errorMessage}>
				{report.warnings.length} check(s) failed — counts below may be incomplete.{' '}
				{report.warnings.slice(0, 3).join('; ')}
			</div>
		{/if}
		<div class={styles.userSummary}>
			<div class={styles.summaryGrid}>
				{#each summary as [label, value] (label)}
					<div class={styles.summaryItem}>
						<span class={styles.fieldLabel}>{label}:</span>
						<span class={styles.fieldValue}>{value}</span>
					</div>
				{/each}
			</div>
		</div>
		{#if report.assets.problems.length > 0}
			<table class={styles.diagnosticsTable}>
				<thead>
					<tr>
						<th>Asset</th>
						<th>Object name</th>
						<th>In bucket</th>
						<th>Meta fileId</th>
						<th>DB fileId</th>
					</tr>
				</thead>
				<tbody>
					{#each report.assets.problems as p (p.assetId)}
						<tr>
							<td>{p.assetId}</td>
							<td>{p.objectName}</td>
							<td>{p.inBucket === null ? 'check failed' : p.inBucket ? 'yes' : 'MISSING'}</td>
							<td>{p.fileIdMeta ?? 'none'}</td>
							<td>{p.dbRow?.fileId ?? 'none'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
		<StructuredDataDisplay data={report} />
	{/if}
</div>
