<script lang="ts">
	import type { Snippet } from 'svelte'
	import { createA11y, setA11y, tryGetA11y } from './a11y'

	let { children }: { children: Snippet } = $props()

	// if the user has already provided a context higher up, reuse that one
	if (!tryGetA11y()) setA11y(createA11y())
</script>

{@render children()}
