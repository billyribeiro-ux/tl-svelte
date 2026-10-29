<script lang="ts">
	import { FILE_PREFIX, type HistoryResponseBody } from '@svelte-draw/dotcom-shared'
	import BoardHistoryLog from '../../components/BoardHistoryLog/BoardHistoryLog.svelte'
	import { routes } from '../../routeDefs'
	import { fetchHistory } from '../../utils/fetchHistory'
	import { params } from '../../utils/router.svelte'
	import TlaFileError from '../components/TlaFileError/TlaFileError.svelte'
	import { getMaybeApp } from '../hooks/useAppState.svelte'
	import { getFetchJson } from '../hooks/useFetchJson.svelte'
	import TlaAnonLayout from '../layouts/TlaAnonLayout/TlaAnonLayout.svelte'
	import { toggleSidebar } from '../utils/local-session-state'

	let { error: _error }: { error?: unknown } = $props()

	const fileSlug = $derived(params.fileSlug)
	const data = getFetchJson<HistoryResponseBody>(() => `/api/${FILE_PREFIX}/${fileSlug}/history`)
	let olderPages = $state.raw<HistoryResponseBody[]>([])
	let isLoading = $state(false)

	const app = getMaybeApp()
	const userId = $derived(app.current?.userId)

	const error = $derived(_error || data.current === null)

	$effect(() => {
		if (error && userId) {
			// force sidebar open
			toggleSidebar(true)
		}
	})

	const pages = $derived(data.current ? [data.current, ...olderPages] : [])
	// Pages can overlap at their boundaries, so dedupe.
	const allTimestamps = $derived([...new Set(pages.flatMap((page) => page.timestamps))])
	const hasMore = $derived(pages.at(-1)?.hasMore ?? false)

	const handleLoadMore = async () => {
		if (!fileSlug || isLoading) return

		isLoading = true
		try {
			// Get the earliest timestamp from the current list
			const earliestTimestamp = allTimestamps[allTimestamps.length - 1]
			const newData = await fetchHistory(fileSlug, earliestTimestamp)
			if (newData) olderPages = [...olderPages, newData]
		} catch (err) {
			console.error('Failed to load more history:', err)
		} finally {
			isLoading = false
		}
	}
</script>

{#if error || data.current}
	<div>
		{#if error}
			<TlaFileError {error} />
		{:else}
			<TlaAnonLayout>
				<BoardHistoryLog
					data={allTimestamps.map((timestamp) => ({
						timestamp,
						href: routes.tlaFileHistorySnapshot({ fileSlug: fileSlug!, timestamp }),
					}))}
					{hasMore}
					onLoadMore={handleLoadMore}
					{isLoading}
				/>
			</TlaAnonLayout>
		{/if}
	</div>
{/if}
