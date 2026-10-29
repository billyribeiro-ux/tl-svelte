<script lang="ts">
	import type { Snippet } from 'svelte'
	// The full app stylesheet for every route, the thumbnail render page included: its job is to look
	// exactly like the app.
	import '../../styles/globals.css'

	let { children }: { children: Snippet } = $props()
</script>

{@render children()}
