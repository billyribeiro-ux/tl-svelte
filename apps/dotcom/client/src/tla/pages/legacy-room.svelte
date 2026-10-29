<script lang="ts">
	import type { RoomOpenMode } from '@svelte-draw/dotcom-shared'
	import { params } from '../../utils/router.svelte'
	import TlaFileError from '../components/TlaFileError/TlaFileError.svelte'
	import TlaLegacyFileEditor from '../components/TlaEditor/TlaLegacyFileEditor.svelte'
	import { getMaybeApp } from '../hooks/useAppState.svelte'
	import ReadyWrapper from '../hooks/ReadyWrapper.svelte'
	import TlaAnonLayout from '../layouts/TlaAnonLayout/TlaAnonLayout.svelte'
	import TlaSidebarLayout from '../layouts/TlaSidebarLayout/TlaSidebarLayout.svelte'
	import { toggleSidebar } from '../utils/local-session-state'

	/*
	When a signed in user visits a legacy shared room, the room should still work as normal.
	The user should be able to participate in the room in the same way as they used
	to be able to participate in the room prior to botcom. In the application UI,
	the user should see the room as if it were owned by some other user. The share
	menu should be replaced with a "Slurp file" button.

	Slurping a file (or whatever) should create a new file in the user's account 
	with all of the data from the legacy shared room. The new copy should have no 
	relationship to the previous room, and the user should be able to edit it just
	like any other file.

	The read-only and old-read-only routes are the same page with a different room
	open mode, so they pass a different `roomOpenMode` (it was `defineLegacyRoomPage(mode)`).
	*/
	let { roomOpenMode, error }: { roomOpenMode: RoomOpenMode; error?: unknown } = $props()

	const roomId = $derived.by(() => {
		const id = params.roomId
		if (!id) throw Error('Room id not found')
		return id
	})

	const app = getMaybeApp()
	const userId = $derived(app.current?.userId)

	$effect(() => {
		if (error && userId) {
			// force sidebar open
			toggleSidebar(true)
		}
	})
</script>

{#if !userId}
	<!--
		Override TlaEditor's internal ReadyWrapper. This prevents the anon layout chrome from rendering
		before the editor is ready.
	-->
	<ReadyWrapper>
		{#if error}
			<TlaFileError {error} />
		{:else}
			<TlaAnonLayout>
				<TlaLegacyFileEditor fileSlug={roomId} {roomOpenMode} />
			</TlaAnonLayout>
		{/if}
	</ReadyWrapper>
{:else}
	<TlaSidebarLayout collapsible>
		{#if error}
			<TlaFileError {error} />
		{:else}
			<TlaLegacyFileEditor fileSlug={roomId} {roomOpenMode} />
		{/if}
	</TlaSidebarLayout>
{/if}
