<script lang="ts">
	import { createSync } from '@svelte-draw/sync'
	import { page } from '$app/state'
	import { SvelteDraw, type Editor } from 'svelte-draw'
	import { getBookmarkPreview } from '#lib/getBookmarkPreview.ts'
	import { multiplayerAssetStore } from '#lib/multiplayerAssetStore.ts'
	import RoomWrapper from '#lib/RoomWrapper.svelte'

	const roomId = $derived(page.params.roomId)

	// Create a store connected to multiplayer.
	const sync = createSync(() => ({
		// We need to know the websockets URI...
		uri: `${window.location.origin}/api/connect/${roomId}`,
		// ...and how to handle static assets like images & videos
		assets: multiplayerAssetStore,
	}))

	function onMount(editor: Editor) {
		// when the editor is ready, we need to register our bookmark unfurling service
		editor.registerExternalAssetHandler('url', getBookmarkPreview)
	}
</script>

<RoomWrapper {roomId}>
	<!--
		we can pass the connected store into the SvelteDraw component which will handle
		loading states & enable multiplayer UX like cursors & a presence menu
	-->
	<SvelteDraw store={sync.current} options={{ deepLinks: true }} {onMount} />
</RoomWrapper>
