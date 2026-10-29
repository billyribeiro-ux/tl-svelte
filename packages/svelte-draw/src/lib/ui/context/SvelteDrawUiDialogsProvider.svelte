<script lang="ts">
	import type { Snippet } from 'svelte'
	import { createDialogs, setDialogs, tryGetDialogs } from './dialogs'

	let { context, children }: { context?: string; children: Snippet } = $props()

	// if the user has already provided a context higher up, reuse that one
	if (!tryGetDialogs()) setDialogs(createDialogs(() => context))
</script>

{@render children()}
