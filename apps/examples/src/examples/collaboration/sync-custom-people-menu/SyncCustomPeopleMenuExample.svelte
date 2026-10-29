<script lang="ts">
	import { createSyncDemo } from '@svelte-draw/sync'
	import { SvelteDraw, type TLComponents } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'
	import './sync-custom-people-menu.css'
	import CustomSharePanel from './CustomSharePanel.svelte'

	let { roomId }: { roomId?: string } = $props()

	// [1]
	const components: TLComponents = {
		SharePanel: CustomSharePanel,
	}

	const sync = createSyncDemo(() => ({ roomId: roomId! }))
</script>

<div class="svelte-draw__editor">
	<SvelteDraw store={sync.current} options={{ deepLinks: true }} {components} />
</div>

<!--
[1]
Replace the `SharePanel` slot (the top-right area where the default people menu lives) with a
custom component. Wrapping it in `tlui-share-zone` keeps the default panel styling.

[2]
The current user's own details come from `editor.user`. Reading them inside `fromComputed` keeps
them reactive, so the panel updates if the name or color changes.

[3]
`editor.getCollaborators()` returns a `TLInstancePresence` record for every other connected user:
name, color, cursor, camera, selection, and more. It's reactive, so calling it inside
`fromComputed` re-renders the panel as people join, leave, or move their cursor.
-->
