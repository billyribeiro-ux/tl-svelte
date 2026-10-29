<script lang="ts">
	import { createSync } from '@svelte-draw/sync'
	import { SvelteDraw, type Editor } from 'svelte-draw'
	import { WORKER_URL, multiplayerAssets, unfurlBookmarkUrl } from '#lib'

	// In this example, the room ID is hard-coded. You can set this however you like though.
	const roomId = 'test-room'

	// Create a store connected to multiplayer.
	const sync = createSync(() => ({
		// We need to know the websocket's URI...
		uri: `${WORKER_URL}/connect/${roomId}`,
		// ...and how to handle static assets like images & videos
		assets: multiplayerAssets,
	}))

	function onMount(editor: Editor) {
		// @ts-expect-error
		window.editor = editor
		// when the editor is ready, we need to register out bookmark unfurling service
		editor.registerExternalAssetHandler('url', unfurlBookmarkUrl)
	}
</script>

<div style="position: fixed; inset: 0">
	<!--
		we can pass the connected store into the SvelteDraw component which will handle
		loading states & enable multiplayer UX like cursors & a presence menu
	-->
	<SvelteDraw store={sync.current} {onMount} />
</div>
