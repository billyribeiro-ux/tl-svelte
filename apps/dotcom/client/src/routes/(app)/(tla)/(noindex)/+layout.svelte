<script lang="ts">
	import type { Snippet } from 'svelte'

	let { children }: { children: Snippet } = $props()
</script>

<svelte:head>
	<meta name="robots" content="noindex, noimageindex, nofollow" />
</svelte:head>

{@render children()}
