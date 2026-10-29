<script lang="ts">
	import { createSync, type UseSyncConnectFn } from '@svelte-draw/sync'
	import { SvelteDraw, type Editor } from 'svelte-draw'
	import { io } from 'socket.io-client'
	import { WORKER_URL, multiplayerAssets, unfurlBookmarkUrl } from '#lib'
	import { socketIoToSvelteDrawSocket } from '#lib/socketio.ts'

	// In this example, the room ID is hard-coded. You can set this however you like though.
	const roomId = 'test-room'

	// A stable function: createSync reconnects whenever the identity of `connect` changes.
	const connect: UseSyncConnectFn = (query) => {
		const socket = io(WORKER_URL, {
			query: { ...query, roomId },
		})
		return socketIoToSvelteDrawSocket(socket)
	}

	// Create a store connected to multiplayer.
	const sync = createSync(() => ({
		// We need a connection to the server:
		connect,
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
