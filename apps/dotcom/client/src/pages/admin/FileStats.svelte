<script lang="ts">
	import type { AdminFileStatsResponseBody } from '@svelte-draw/dotcom-shared'
	import { fetch } from 'svelte-draw'
	import AdminButton from './AdminButton.svelte'
	import styles from './admin.module.css'
	import FileStatsReport from './FileStatsReport.svelte'
	import { getResponseError } from './shared.svelte'

	/**
	 * A content-free profile of a board: how many shapes, how deeply nested, how much text, how big the
	 * snapshot. Enough to reason about a slow or broken board — or to answer "what does a board this
	 * size actually look like" — without opening it or seeing anything on it.
	 */
	let input = $state<HTMLInputElement | null>(null)
	let error = $state<string | null>(null)
	let isLoading = $state(false)
	let stats = $state.raw<AdminFileStatsResponseBody | null>(null)

	async function onGetStats() {
		const slug = input?.value?.trim()
		if (!slug) {
			error = 'Please enter a file slug'
			return
		}
		error = null
		stats = null
		isLoading = true
		try {
			const res = await fetch(`/api/app/admin/file-stats/${encodeURIComponent(slug)}`)
			if (!res.ok) {
				error = await getResponseError(res)
				return
			}
			stats = (await res.json()) as AdminFileStatsResponseBody
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to get board stats'
		} finally {
			isLoading = false
		}
	}
</script>

<div class={styles.fileOperation}>
	<p>
		Counts and sizes for a board&apos;s last persisted snapshot. Nothing here is board content or a
		person&apos;s identity, so a report is safe to paste into an issue or a support reply.
	</p>
	{#if error}<div class={styles.errorMessage}>{error}</div>{/if}
	<div class={styles.searchContainer}>
		<input
			type="text"
			placeholder="File slug"
			bind:this={input}
			class={styles.searchInput}
			onkeydown={(e) => {
				if (e.key === 'Enter') onGetStats()
			}}
		/>
		<AdminButton onclick={onGetStats} variant="primary" {isLoading}>Get stats</AdminButton>
	</div>
	{#if stats}<FileStatsReport {stats} />{/if}
</div>
