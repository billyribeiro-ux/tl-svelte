<script lang="ts">
	import type { SerializedSchema, TLRecord, TLStoreSnapshot } from 'svelte-draw'
	import { params } from '../../utils/router.svelte'
	import TlaFileError from '../components/TlaFileError/TlaFileError.svelte'
	import TlaLegacySnapshotEditor from '../components/TlaEditor/TlaLegacySnapshotEditor.svelte'
	import { getMaybeApp } from '../hooks/useAppState.svelte'
	import ReadyWrapper from '../hooks/ReadyWrapper.svelte'
	import TlaAnonLayout from '../layouts/TlaAnonLayout/TlaAnonLayout.svelte'
	import TlaSidebarLayout from '../layouts/TlaSidebarLayout/TlaSidebarLayout.svelte'
	import { toggleSidebar } from '../utils/local-session-state'

	/*
	When a signed in user visits a legacy snapshot, the room should still work as normal.
	The user should be able to interact with the snapshot in the same way as they used
	to be able to interact with the snapshot prior to botcom. In the application UI,
	the user should see the room as if it were owned by some other user. The share
	menu should be replaced with a "Slurp file" button.

	Slurping a file (or whatever) should create a new file in the user's account 
	with all of the data from the legacy shared room. The new copy should have no 
	relationship to the previous room, and the user should be able to edit it just
	like any other file.
	*/

	// `data` is the route's load result. It is absent in the render of `+error.svelte` (the old
	// `useMaybeData()`: no loader data when the loader rejected).
	let {
		data,
		error: _error,
	}: {
		data?: { roomId: string; schema: SerializedSchema; records: TLRecord[] }
		error?: unknown
	} = $props()

	const roomId = $derived.by(() => {
		const id = params.roomId
		if (!id) throw Error('Room id not found')
		return id
	})

	const app = getMaybeApp()
	const userId = $derived(app.current?.userId)

	const snapshot = $derived.by(() => {
		if (!data) return null
		return {
			schema: data.schema,
			store: Object.fromEntries(data.records.map((record) => [record.id, record])),
		} as TLStoreSnapshot
	})

	const error = $derived(_error || !snapshot)

	$effect(() => {
		if (error && userId) {
			// force sidebar open
			toggleSidebar(true)
		}
	})
</script>

{#snippet content()}
	{#if error}
		<TlaFileError {error} />
	{:else if snapshot}
		<TlaLegacySnapshotEditor fileSlug={roomId} {snapshot} />
	{/if}
{/snippet}

{#if !userId}
	<ReadyWrapper>
		{#if error}
			{@render content()}
		{:else}
			<TlaAnonLayout>{@render content()}</TlaAnonLayout>
		{/if}
	</ReadyWrapper>
{:else}
	<TlaSidebarLayout collapsible>{@render content()}</TlaSidebarLayout>
{/if}
