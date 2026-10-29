<script lang="ts">
	import type { Snippet } from 'svelte'
	import DocsSearchBar from '#lib/components/docs/DocsSearchBar.svelte'

	let { children }: { children: Snippet } = $props()
</script>

<svelte:head>
	<meta name="description" content="Documentation for the svelte-draw SDK." />
</svelte:head>

<DocsSearchBar />
{@render children()}
