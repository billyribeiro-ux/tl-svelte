<script lang="ts">
	import type { Snippet } from 'svelte'
	import { setFocusLines } from './code-context'

	let { children, lines }: { children?: Snippet; lines: number[] } = $props()

	// The lines are fixed for the lifetime of this component (they come from MDX attributes).
	// svelte-ignore state_referenced_locally
	setFocusLines(lines)
</script>

{@render children?.()}
