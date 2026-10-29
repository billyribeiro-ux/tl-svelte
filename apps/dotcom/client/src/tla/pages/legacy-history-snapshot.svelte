<script lang="ts">
	import { ROOM_PREFIX } from '@svelte-draw/dotcom-shared'
	import type { RoomSnapshot } from '@svelte-draw/sync-core'
	import { fetch, type TLStoreSnapshot } from 'svelte-draw'
	import { params } from '../../utils/router.svelte'
	import TlaHistorySnapshotEditor from '../components/TlaEditor/TlaHistorySnapshotEditor.svelte'
	import TlaFileError from '../components/TlaFileError/TlaFileError.svelte'
	import { getMaybeApp } from '../hooks/useAppState.svelte'
	import { getFetchJson } from '../hooks/useFetchJson.svelte'
	import TlaAnonLayout from '../layouts/TlaAnonLayout/TlaAnonLayout.svelte'
	import { toggleSidebar } from '../utils/local-session-state'

	let { error: _error }: { error?: unknown } = $props()

	const app = getMaybeApp()
	const userId = $derived(app.current?.userId)

	const boardId = $derived(params.boardId)
	const timestamp = $derived(params.timestamp)
	const data = getFetchJson<RoomSnapshot>(
		() => `/api/${ROOM_PREFIX}/${boardId}/history/${timestamp}`
	)

	const snapshot = $derived.by(() => {
		if (!data.current) return null
		return {
			schema: data.current.schema,
			store: Object.fromEntries(
				data.current.documents.map((record) => [record.state.id, record.state])
			),
		} as TLStoreSnapshot
	})

	const error = $derived(_error || data.current === null || !boardId || !timestamp)

	$effect(() => {
		if (error && userId) {
			// force sidebar open
			toggleSidebar(true)
		}
	})
</script>

{#if error}
	<TlaFileError {error} />
{:else if snapshot}
	<TlaAnonLayout>
		<TlaHistorySnapshotEditor
			fileSlug={boardId!}
			{snapshot}
			onRestore={async () => {
				const res = await fetch(`/api/r/${boardId}/restore`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ timestamp }),
				})
				if (!res.ok) {
					throw new Error('Failed to restore version: ' + (await res.text()))
				}
			}}
		/>
	</TlaAnonLayout>
{/if}
