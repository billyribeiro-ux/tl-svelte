<script lang="ts">
	import { createSyncDemo } from '@svelte-draw/sync'
	import { SvelteDraw } from 'svelte-draw'
	import 'svelte-draw/svelte-draw.css'

	let { roomId }: { roomId?: string } = $props()

	const sync = createSyncDemo(() => ({ roomId: roomId! }))
</script>

<div class="svelte-draw__editor">
	<SvelteDraw store={sync.current} options={{ deepLinks: true }} />
</div>
