<script lang="ts">
	import type { Snippet } from 'svelte'
	import { setCodeLinks } from './code-context'

	let { children, links }: { children?: Snippet; links: Record<string, string> } = $props()

	// The links are fixed for the lifetime of this component (they come from MDX attributes).
	// svelte-ignore state_referenced_locally
	setCodeLinks(links)
</script>

{@render children?.()}
