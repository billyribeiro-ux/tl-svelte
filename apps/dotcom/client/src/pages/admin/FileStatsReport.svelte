<script lang="ts">
	import type { AdminFileStatsResponseBody } from '@svelte-draw/dotcom-shared'
	import styles from './admin.module.css'
	import { formatBytes, formatTally } from './shared.svelte'
	import StructuredDataDisplay from './StructuredDataDisplay.svelte'

	let { stats }: { stats: AdminFileStatsResponseBody } = $props()

	function formatNumber(value: number) {
		return value.toLocaleString()
	}

	function formatTimestamp(value: number) {
		if (!value) return 'unknown'
		return new Date(value).toISOString().slice(0, 10)
	}

	const summary = $derived.by((): Array<[string, string]> => {
		const { file, snapshot, pages, shapes, text, bindings, assets, collaboration } = stats
		const { arrows } = bindings

		return [
			[
				'Snapshot size',
				snapshot.sizeBytes === null ? 'check failed' : formatBytes(snapshot.sizeBytes),
			],
			['Records', `${formatNumber(snapshot.records)} (${formatTally(snapshot.recordsByTypeName)})`],
			['Tombstones', formatNumber(snapshot.tombstones)],
			[
				'Pages',
				`${formatNumber(pages.total)} (largest ${formatNumber(pages.maxShapesOnAPage)} shapes${
					pages.empty > 0 ? `, ${formatNumber(pages.empty)} empty` : ''
				})`,
			],
			['Shapes', `${formatNumber(shapes.total)} (${formatTally(shapes.byType)})`],
			[
				'Nesting depth',
				shapes.maxDepth <= 1 ? 'flat' : `${shapes.maxDepth} levels of frames and groups`,
			],
			['Locked / rotated', `${formatNumber(shapes.locked)} / ${formatNumber(shapes.rotated)}`],
			[
				'Orphaned shapes',
				shapes.orphaned === 0 ? 'none' : `⚠️ ${formatNumber(shapes.orphaned)} with no page`,
			],
			[
				'Extent',
				shapes.extent
					? `${formatNumber(shapes.extent.width)} × ${formatNumber(shapes.extent.height)} (top-level shapes, unrotated)`
					: 'no shapes',
			],
			[
				'Text',
				text.shapesWithText === 0
					? 'none'
					: `${formatNumber(text.shapesWithText)} shapes, ${formatNumber(text.totalCharacters)} chars (longest ${formatNumber(text.longestCharacters)})`,
			],
			['Bindings', `${formatNumber(bindings.total)} (${formatTally(bindings.byType)})`],
			[
				'Arrow ends',
				`${formatNumber(arrows.boundBothEnds)} bound both, ${formatNumber(arrows.boundOneEnd)} bound one, ${formatNumber(arrows.unbound)} free${
					arrows.dangling > 0 ? `, ⚠️ ${formatNumber(arrows.dangling)} dangling` : ''
				}`,
			],
			[
				'Assets',
				assets.total === 0
					? 'none'
					: `${formatNumber(assets.total)} (${formatTally(assets.byType)}), ${formatBytes(assets.totalSizeBytes)} declared`,
			],
			[
				'Collaboration',
				`${formatNumber(collaboration.visitors)} visitors, ${formatNumber(collaboration.commentThreads)} threads, ${formatNumber(collaboration.comments)} comments`,
			],
			['Schema', snapshot.schemaVersion === null ? 'unknown' : `version ${snapshot.schemaVersion}`],
			['Clock', `${snapshot.clock ?? 'unknown'} (document ${snapshot.documentClock ?? 'unknown'})`],
			[
				'File row',
				file
					? `${file.ownerType}-owned, created ${formatTimestamp(file.createdAt)}, updated ${formatTimestamp(file.updatedAt)}`
					: 'none (legacy room?)',
			],
			[
				'Sharing',
				file
					? [
							file.shared ? `shared (${file.sharedLinkType})` : 'not shared',
							file.published ? 'published' : null,
							file.isDeleted ? 'deleted' : null,
							file.isEmpty ? 'marked empty' : null,
							file.createSourceKind ? `from ${file.createSourceKind}` : null,
						]
							.filter(Boolean)
							.join(', ')
					: 'unknown',
			],
		]
	})
</script>

{#if stats.warnings.length > 0}
	<div class={styles.errorMessage}>
		{stats.warnings.length} check(s) failed — some counts below may be incomplete.{' '}
		{stats.warnings.slice(0, 3).join('; ')}
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
{#if Object.keys(stats.styles).length > 0}
	<h4 class={styles.subTitle}>Styles</h4>
	<div class={styles.summaryGrid}>
		{#each Object.entries(stats.styles).sort((a, b) => a[0].localeCompare(b[0])) as [prop, tally] (prop)}
			<div class={styles.summaryItem}>
				<span class={styles.fieldLabel}>{prop}:</span>
				<span class={styles.fieldValue}>{formatTally(tally)}</span>
			</div>
		{/each}
	</div>
{/if}
<StructuredDataDisplay data={stats} />
