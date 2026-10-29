<script lang="ts">
	import type { Snippet } from 'svelte'
	import Callout from './Callout.svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<Callout>{@render children?.()}</Callout>
