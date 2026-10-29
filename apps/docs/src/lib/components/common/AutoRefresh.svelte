<script lang="ts">
	import { onMount, type Snippet } from 'svelte'
	import { invalidateAll } from '$app/navigation'

	let { children }: { children?: Snippet } = $props()

	// Development only: watcher.ts rebuilds content.db when content changes and pings this socket.
	onMount(() => {
		if (!import.meta.env.DEV) return
		const ws = new WebSocket('ws://localhost:3201')
		ws.onmessage = (event) => {
			if (event.data === 'refresh') {
				invalidateAll()
			}
		}
		return () => {
			ws.close()
		}
	})
</script>

{@render children?.()}
