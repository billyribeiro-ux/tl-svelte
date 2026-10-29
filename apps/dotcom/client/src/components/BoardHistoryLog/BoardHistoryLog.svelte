<script lang="ts" module>
	// todo: remove tailwind

	export interface HistoryEntry {
		timestamp: string
		/** Must be absolute: a relative href resolves against the url, not the route. */
		href?: string
	}

	const monthFormat = Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'long' })
	const dateFormat = Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		second: 'numeric',
	})

	export function groupTimestampsByMonth(entries: HistoryEntry[]) {
		const groups = new Map<string, HistoryEntry[]>()
		for (const entry of entries) {
			const month = monthFormat.format(new Date(entry.timestamp))
			const group = groups.get(month)
			if (group) group.push(entry)
			else groups.set(month, [entry])
		}
		return [...groups].map(([month, timestamps]) => ({ month, timestamps }))
	}

	export function formatHistoryDate(timestamp: string) {
		return dateFormat.format(new Date(timestamp))
	}
</script>

<script lang="ts">
	import { location } from '../../utils/router.svelte'

	let {
		data,
		hasMore,
		onLoadMore,
		isLoading,
	}: {
		data: HistoryEntry[]
		hasMore?: boolean
		onLoadMore?(): void
		isLoading?: boolean
	} = $props()

	const groupedData = $derived(groupTimestampsByMonth(data))
</script>

{#if data.length === 0}
	<div>
		<p>No history found</p>
	</div>
{:else}
	<div class="board-history">
		<h1>Board history</h1>
		<p>Recent versions of this file. You can restore any previous version.</p>
		<div class="board-history__list">
			{#each groupedData as group (group.month)}
				<div class="board-history__month-group">
					<h3 class="board-history__month-header">{group.month}</h3>
					<ol class="board-history__list">
						{#each group.timestamps as { timestamp, href } (timestamp)}
							<li>
								<a href={href || `${location.pathname.replace(/\/$/, '')}/${timestamp}`}>
									{formatHistoryDate(timestamp)}
								</a>
							</li>
						{/each}
					</ol>
				</div>
			{/each}
		</div>
		{#if hasMore}
			<div class="board-history__load-more">
				<button
					onclick={onLoadMore}
					disabled={isLoading}
					class="board-history__load-more-button"
				>
					{isLoading ? 'Loading...' : 'Load More'}
				</button>
			</div>
		{/if}
	</div>
{/if}
