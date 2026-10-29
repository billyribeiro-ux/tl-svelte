<script lang="ts">
	import type { Snippet } from 'svelte'
	import { createToasts, setToasts, tryGetToasts } from './toasts'

	let { children }: { children: Snippet } = $props()

	// if the user has already provided a context higher up, reuse that one
	if (!tryGetToasts()) setToasts(createToasts())
</script>

{@render children()}
