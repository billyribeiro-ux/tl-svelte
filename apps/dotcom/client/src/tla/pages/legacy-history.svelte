<script lang="ts">
	import { ROOM_PREFIX, type HistoryResponseBody } from '@svelte-draw/dotcom-shared'
	import BoardHistoryLog from '../../components/BoardHistoryLog/BoardHistoryLog.svelte'
	import { routes } from '../../routeDefs'
	import { params } from '../../utils/router.svelte'
	import TlaFileError from '../components/TlaFileError/TlaFileError.svelte'
	import { getMaybeApp } from '../hooks/useAppState.svelte'
	import { getFetchJson } from '../hooks/useFetchJson.svelte'
	import TlaAnonLayout from '../layouts/TlaAnonLayout/TlaAnonLayout.svelte'
	import { toggleSidebar } from '../utils/local-session-state'

	/*
	History here should work in an identical way to its previous implementation.
	*/

	// todo: Add top bar for anon users (branding, sign in, etc)

	let { error: _error }: { error?: unknown } = $props()

	const boardId = $derived(params.boardId)
	const data = getFetchJson<HistoryResponseBody>(() => `/api/${ROOM_PREFIX}/${boardId}/history`)

	const app = getMaybeApp()
	const userId = $derived(app.current?.userId)

	const error = $derived(_error || data.current === null)

	$effect(() => {
		if (error && userId) {
			// force sidebar open
			toggleSidebar(true)
		}
	})
</script>

{#if error}
	<TlaFileError {error} />
{:else if data.current}
	<TlaAnonLayout>
		<BoardHistoryLog
			data={data.current.timestamps.map((timestamp) => ({
				timestamp,
				href: routes.tlaLegacyRoomHistorySnapshot({ boardId: boardId!, timestamp }),
			}))}
		/>
	</TlaAnonLayout>
{/if}
