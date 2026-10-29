import { FILE_PREFIX, type HistoryResponseBody } from '@svelte-draw/dotcom-shared'
import { fetch } from 'svelte-draw'

// Helper function to fetch history data
export async function fetchHistory(
	fileSlug: string,
	offset?: string
): Promise<HistoryResponseBody | null> {
	try {
		const url = offset
			? `/api/${FILE_PREFIX}/${fileSlug}/history?offset=${offset}`
			: `/api/${FILE_PREFIX}/${fileSlug}/history`

		const result = await fetch(url)

		if (!result.ok) return null

		return await result.json()
	} catch (err) {
		console.error('Failed to fetch history:', err)
		return null
	}
}
