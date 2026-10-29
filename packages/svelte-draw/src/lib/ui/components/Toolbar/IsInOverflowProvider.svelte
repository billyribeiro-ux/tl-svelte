<script lang="ts">
	import type { Snippet } from 'svelte'
	import { setIsInOverflow } from './isInOverflow'

	let { children }: { children?: Snippet } = $props()

	setIsInOverflow(true)
</script>

{@render children?.()}
