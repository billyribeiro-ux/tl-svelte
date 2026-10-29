<script lang="ts">
	import type { Snippet } from 'svelte'
	import { getMaybeApp } from '../hooks/useAppState.svelte'

	let { children }: { children: Snippet } = $props()
	const app = getMaybeApp()
</script>

{#if app.current}
	{@render children()}
{/if}
